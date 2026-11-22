"""Serve the YouTube-to-MP3 tool on loopback."""
import argparse
import json
import math
import os
from pathlib import Path
import re
import shutil
import signal
import sqlite3
import subprocess
from tempfile import TemporaryDirectory
from threading import BoundedSemaphore
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote, urlsplit
from zipfile import ZipFile
from feed import Library

PAGE = Path(__file__).with_name('index.html')
VIDEO_ID = re.compile(r'[A-Za-z0-9_-]{11}')
CONVERSION = BoundedSemaphore(1)
DEPENDENCIES = ('yt-dlp', 'ffmpeg', 'ffprobe', 'deno')
BATCH_LIMIT = 20
MAX_STAGED = 60
URL_IN_TEXT = re.compile(r'https?://[^\s<>"\x27()[\]{},;，。；、（）【】《》「」]+', re.I)


def video_id(value):
    if not isinstance(value, str):
        return None
    try:
        url = urlsplit(value.strip())
    except ValueError:
        return None
    if url.scheme not in ('http', 'https'):
        return None
    path = url.path.strip('/').split('/')
    if url.netloc.lower() == 'youtu.be' and len(path) == 1:
        candidate = path[0]
    elif url.netloc.lower() in ('youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'):
        if url.path == '/watch':
            candidate = parse_qs(url.query).get('v', [''])[0]
        elif len(path) == 2 and path[0] in ('shorts', 'live', 'embed'):
            candidate = path[1]
        else:
            return None
    else:
        return None
    return candidate if VIDEO_ID.fullmatch(candidate) else None


def download_name(title, identifier):
    safe_title = re.sub(r'[<>:"/\\|?*\x00-\x1f\x7f]', '_', title).strip(' .')
    safe_title = safe_title.encode('utf-8')[:240].decode('utf-8', errors='ignore').rstrip(' .')
    return f'{safe_title or f"youtube-{identifier}"}.mp3'


def valid_title_overrides(titles):
    return isinstance(titles, dict) and len(titles) <= BATCH_LIMIT and all(
        VIDEO_ID.fullmatch(identifier) and isinstance(title, str) and 0 < len(title) <= 240
        and title.strip() and not any(0xD800 <= ord(char) <= 0xDFFF for char in title)
        for identifier, title in titles.items()
    )


def media_duration(path):
    try:
        result = subprocess.check_output(
            ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
             '-of', 'default=nw=1:nk=1', str(path)],
            stderr=subprocess.DEVNULL, timeout=10,
        )
        seconds = float(result)
        if math.isfinite(seconds) and seconds >= 0:
            return round(seconds)
    except (OSError, ValueError, subprocess.SubprocessError):
        pass
    return None


def stop_server(_signal, _frame):
    raise SystemExit


class Handler(BaseHTTPRequestHandler):
    @property
    def origin(self):
        return f'http://127.0.0.1:{self.server.server_port}'

    def send_content(self, status, content_type, body):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def error(self, status, message):
        self.send_json({'error': message}, status)

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_content(status, 'application/json; charset=utf-8', body)

    def do_GET(self):
        if self.path in ('/', '/mp3', '/mp3/', '/mp3-convertor', '/mp3-convertor/'):
            self.send_content(200, 'text/html; charset=utf-8', PAGE.read_bytes())
        elif self.path == '/feed.xml':
            self.send_content(200, 'application/rss+xml; charset=utf-8',
                              self.server.library.rss(self.origin))
        elif self.path.startswith(('/batch/download?', '/batch/mp3?')):
            if self.headers.get('Host') != self.origin.removeprefix('http://'):
                return self.error(403, '请从本机工具页面下载。')
            query = parse_qs(urlsplit(self.path).query)
            identifiers = query.get('id', [])
            titles = {name[5:]: values[0] for name, values in query.items()
                      if name.startswith('name-')}
            if not valid_title_overrides(titles):
                return self.error(400, '音频名称无效。')
            if self.path.startswith('/batch/download?'):
                self.send_zip(identifiers, titles)
            elif len(identifiers) == 1:
                with CONVERSION:
                    entries = self.batch_entries(identifiers)
                    if not entries or not entries[0][2]:
                        return self.error(404, '临时音频已过期，请重新转换。')
                    identifier, title, path = entries[0]
                    try:
                        self.send_download(path, titles.get(identifier, title), identifier, 'skipped')
                    except (BrokenPipeError, ConnectionResetError):
                        self.close_connection = True
            else:
                self.error(400, '请选择一个音频。')
        else:
            self.serve_episode()

    def do_HEAD(self):
        self.serve_episode()

    def serve_episode(self):
        match = re.fullmatch(r'/audio/([A-Za-z0-9_-]{11})\.mp3', self.path)
        if not match or self.server.library.title(match[1]) is None:
            self.send_error(404)
            return
        with self.server.library.audio(match[1]).open('rb') as audio:
            size = os.fstat(audio.fileno()).st_size
            start, end = 0, size - 1
            byte_range = self.headers.get('Range') if self.command == 'GET' else None
            if byte_range:
                bounds = re.fullmatch(r'bytes=([0-9]{0,20})-([0-9]{0,20})', byte_range)
                if bounds and bounds[1]:
                    start = int(bounds[1])
                    end = min(int(bounds[2]), end) if bounds[2] else end
                elif bounds and bounds[2]:
                    start = max(0, size - int(bounds[2]))
                else:
                    start = size
                if start > end:
                    self.send_response(416)
                    self.send_header('Content-Range', f'bytes */{size}')
                    self.end_headers()
                    return
            remaining = end - start + 1
            self.send_response(206 if byte_range else 200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Accept-Ranges', 'bytes')
            self.send_header('Content-Length', str(remaining))
            if byte_range:
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.end_headers()
            if self.command == 'HEAD':
                return
            audio.seek(start)
            try:
                while remaining:
                    chunk = audio.read(min(remaining, 65536))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    remaining -= len(chunk)
            except (BrokenPipeError, ConnectionResetError):
                self.close_connection = True

    def do_POST(self):
        if self.path not in ('/convert', '/batch/links', '/batch/rss'):
            return self.error(404, '找不到该接口。')
        origin = self.origin
        if self.headers.get('Host') != origin.removeprefix('http://') or self.headers.get('Origin') != origin:
            return self.error(403, '请从本机工具页面提交转换。')
        if self.headers.get_content_type() != 'application/json':
            return self.error(415, '请求格式应为 JSON。')
        try:
            length = int(self.headers.get('Content-Length', '0'))
            limit = 4096 if self.path == '/convert' else 131072
            if not 0 < length <= limit:
                return self.error(400, '输入太长或为空。')
            payload = json.loads(self.rfile.read(length))
        except (ValueError, TimeoutError):
            return self.error(400, '请求格式无效。')
        if not isinstance(payload, dict):
            return self.error(400, '请求格式无效。')
        if self.path == '/batch/links':
            source = payload.get('text')
            if not isinstance(source, str):
                return self.error(400, '请输入 YouTube 链接。')
            identifiers = list(dict.fromkeys(
                identifier for match in URL_IN_TEXT.finditer(source)
                if (identifier := video_id(match[0].rstrip('.;!?:，。；、')))
            ))
            if not identifiers or len(identifiers) > BATCH_LIMIT:
                return self.error(400, f'请输入 1 至 {BATCH_LIMIT} 个有效的 YouTube 视频链接。')
            return self.send_json({'ids': identifiers})
        if self.path == '/batch/rss':
            return self.batch_rss(payload.get('ids'), payload.get('titles', {}))
        identifier = video_id(payload.get('url'))
        if not identifier:
            return self.error(400, '请输入有效的 YouTube 单个视频链接。')
        add_to_feed = payload.get('addToFeed', False)
        preview = payload.get('preview', False)
        if not isinstance(add_to_feed, bool) or not isinstance(preview, bool):
            return self.error(400, '加入 RSS 的选项无效。')
        if not CONVERSION.acquire(blocking=False):
            return self.error(429, '正在处理另一项转换，请稍后再试。')
        try:
            library = self.server.library
            title = library.title(identifier)
            if title is not None:
                if preview:
                    self.send_result(identifier, title, library.audio(identifier), 'existing')
                else:
                    self.send_download(library.audio(identifier), title, identifier,
                                       'existing' if add_to_feed else 'skipped')
            elif preview and identifier in self.server.staged:
                title, output = self.server.staged[identifier]
                self.finish_conversion(output, title, identifier, add_to_feed, preview)
            else:
                self.convert(identifier, add_to_feed, preview)
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True
        finally:
            CONVERSION.release()

    def convert(self, identifier, add_to_feed, preview):
        missing = [name for name in DEPENDENCIES if not shutil.which(name)]
        if missing:
            return self.error(503, f'本机缺少转换依赖：{", ".join(missing)}。')
        with TemporaryDirectory(prefix='youtube-mp3-') as directory:
            output = Path(directory) / 'audio.mp3'
            command = [
                'yt-dlp', '--ignore-config', '--no-playlist', '--no-cache-dir',
                '--no-colors', '--no-progress', '--socket-timeout', '15',
                '--match-filter', '!is_live & duration <= 3600',
                '--max-filesize', '100M', '-f', 'bestaudio', '-x',
                '--audio-format', 'mp3', '--audio-quality', '192K',
                '--no-simulate', '--print', 'after_move:%(title)j',
                '-o', 'audio.%(ext)s', '--', f'https://www.youtube.com/watch?v={identifier}',
            ]
            with subprocess.Popen(command, cwd=directory, start_new_session=True,
                                  stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                                  env={**os.environ, 'YTDLP_NO_PLUGINS': '1'}) as process:
                try:
                    stdout, _ = process.communicate(timeout=240)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    return self.error(504, '转换超时，请重试或换一个较短的视频。')
            if process.returncode or not output.is_file() or not output.stat().st_size:
                return self.error(422, '无法提取音频。请尝试另一个可访问的公开视频，并确认视频未在直播、时长不超过 60 分钟。')
            try:
                title = json.loads(stdout)
            except ValueError:
                title = None
            title = title if isinstance(title, str) and title else f'youtube-{identifier}'
            self.finish_conversion(output, title, identifier, add_to_feed, preview)

    def save_episode(self, identifier, title, output, rename_existing=False):
        try:
            added = self.server.library.add(identifier, title, output, rename_existing)
            return 'added' if added else 'existing'
        except (OSError, sqlite3.Error) as error:
            self.log_error('Could not save episode: %s', error)
            return 'failed'

    def finish_conversion(self, output, title, identifier, add_to_feed, preview):
        feed_status = self.save_episode(identifier, title, output) if add_to_feed else 'skipped'
        if not preview:
            self.send_download(output, title, identifier, feed_status)
            return
        if feed_status in ('added', 'existing'):
            self.send_result(identifier, title, self.server.library.audio(identifier), feed_status)
            return
        staged = self.server.staged
        if identifier not in staged:
            destination = self.server.staging / f'{identifier}.mp3'
            try:
                shutil.move(output, destination)
            except OSError:
                return self.error(500, '无法保存临时音频，请检查磁盘空间。')
            staged[identifier] = (title, destination)
            if len(staged) > MAX_STAGED:
                _, oldest = staged.pop(next(iter(staged)))
                oldest.unlink(missing_ok=True)
        self.send_result(identifier, title, staged[identifier][1], feed_status)

    def send_result(self, identifier, title, output, feed_status):
        self.send_json({
            'id': identifier, 'name': download_name(title, identifier),
            'duration': media_duration(output), 'feedStatus': feed_status,
        })

    def batch_entries(self, identifiers):
        if not isinstance(identifiers, list) or not 0 < len(identifiers) <= BATCH_LIMIT:
            return None
        if not all(isinstance(identifier, str) and VIDEO_ID.fullmatch(identifier)
                   for identifier in identifiers):
            return None
        entries = []
        for identifier in dict.fromkeys(identifiers):
            title = self.server.library.title(identifier)
            fallback = self.server.staged.get(identifier, (None, None))
            path = self.server.library.audio(identifier)
            entries.append((identifier, title, path) if title is not None else (identifier, *fallback))
        return entries

    def batch_rss(self, identifiers, titles):
        if not valid_title_overrides(titles):
            return self.error(400, '音频名称无效。')
        with CONVERSION:
            entries = self.batch_entries(identifiers)
            if not entries:
                return self.error(400, '请选择要加入 RSS 的音频。')
            results = {}
            for identifier, title, path in entries:
                if not path:
                    results[identifier] = 'expired'
                    continue
                results[identifier] = self.save_episode(
                    identifier, titles.get(identifier, title), path, identifier in titles
                )
            self.send_json(results)

    def send_zip(self, identifiers, titles):
        with TemporaryDirectory(prefix='youtube-mp3-zip-') as directory:
            archive = Path(directory) / 'youtube-mp3.zip'
            with CONVERSION:
                entries = self.batch_entries(identifiers)
                if not entries:
                    return self.error(400, '请选择要下载的音频。')
                if any(path is None for _, _, path in entries):
                    return self.error(404, '部分临时音频已过期，请重新转换。')
                names = set()
                with ZipFile(archive, 'w') as bundle:
                    for identifier, title, path in entries:
                        name = download_name(titles.get(identifier, title), identifier)
                        while name.casefold() in names:
                            name = download_name(f'{identifier} {name[:-4]}', identifier)
                        names.add(name.casefold())
                        bundle.write(path, name)
            try:
                with archive.open('rb') as stream:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/zip')
                    self.send_header('Content-Disposition', 'attachment; filename="youtube-mp3.zip"')
                    self.send_header('Content-Length', str(archive.stat().st_size))
                    self.send_header('Cache-Control', 'no-store')
                    self.end_headers()
                    shutil.copyfileobj(stream, self.wfile)
            except (BrokenPipeError, ConnectionResetError):
                self.close_connection = True

    def send_download(self, output, title, identifier, feed_status):
        filename = download_name(title, identifier)
        with output.open('rb') as audio:
            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Content-Disposition',
                             f'attachment; filename="youtube-{identifier}.mp3"; '
                             f"filename*=UTF-8''{quote(filename, safe='')}")
            self.send_header('Content-Length', str(os.fstat(audio.fileno()).st_size))
            self.send_header('X-Feed-Status', feed_status)
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            shutil.copyfileobj(audio, self.wfile)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--data-dir', type=Path, default=PAGE.with_name('data'))
    args = parser.parse_args()
    signal.signal(signal.SIGTERM, stop_server)
    with TemporaryDirectory(prefix='youtube-mp3-batch-') as staging, \
            ThreadingHTTPServer(('127.0.0.1', args.port), Handler) as server:
        server.library = Library(args.data_dir)
        server.staged = {}
        server.staging = Path(staging)
        print(f'http://127.0.0.1:{server.server_port}/mp3/', flush=True)
        server.serve_forever()
