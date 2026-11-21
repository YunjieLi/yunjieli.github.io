"""Store MP3s and episode metadata on the local filesystem."""
from contextlib import closing
from datetime import datetime, timezone
from email.utils import format_datetime
from pathlib import Path
import re
import shutil
import sqlite3
from tempfile import NamedTemporaryFile
from xml.etree.ElementTree import Element, SubElement, tostring


class Library:
    def __init__(self, root):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.database = self.root / 'episodes.sqlite3'
        with closing(sqlite3.connect(self.database)) as db, db:
            db.execute('''CREATE TABLE IF NOT EXISTS episodes (
                id TEXT PRIMARY KEY, title TEXT NOT NULL, published TEXT NOT NULL
            )''')

    def audio(self, identifier):
        return self.root / f'{identifier}.mp3'

    def title(self, identifier):
        with closing(sqlite3.connect(self.database)) as db:
            row = db.execute('SELECT title FROM episodes WHERE id = ?', (identifier,)).fetchone()
        return row[0] if row and self.audio(identifier).is_file() else None

    def add(self, identifier, title, source, rename_existing=False):
        with closing(sqlite3.connect(self.database)) as db, db:
            db.execute('BEGIN IMMEDIATE')
            destination = self.audio(identifier)
            if destination.is_file() and db.execute(
                'SELECT 1 FROM episodes WHERE id = ?', (identifier,)
            ).fetchone():
                if rename_existing:
                    db.execute('UPDATE episodes SET title = ? WHERE id = ?', (title, identifier))
                return False
            with NamedTemporaryFile(dir=self.root, delete=False) as temporary:
                staging = Path(temporary.name)
                try:
                    with source.open('rb') as audio:
                        shutil.copyfileobj(audio, temporary)
                    temporary.close()
                    staging.replace(destination)
                finally:
                    staging.unlink(missing_ok=True)
            published = format_datetime(datetime.now(timezone.utc), usegmt=True)
            db.execute('INSERT OR IGNORE INTO episodes VALUES (?, ?, ?)',
                       (identifier, title, published))
            return True

    def rss(self, origin):
        channel_feed = Element('rss', version='2.0')
        channel = SubElement(channel_feed, 'channel')
        SubElement(channel, 'title').text = '7MagicFlowers'
        SubElement(channel, 'link').text = f'{origin}/'
        SubElement(channel, 'description').text = '已加入订阅的 YouTube 音频'
        SubElement(channel, 'language').text = 'zh-CN'
        with closing(sqlite3.connect(self.database)) as db:
            rows = db.execute('SELECT id, title, published FROM episodes ORDER BY rowid DESC').fetchall()
        for identifier, title, published in rows:
            try:
                length = self.audio(identifier).stat().st_size
            except FileNotFoundError:
                continue
            item = SubElement(channel, 'item')
            SubElement(item, 'title').text = re.sub(
                r'[^\x09\x0a\x0d\x20-\ud7ff\ue000-\ufffd\U00010000-\U0010ffff]', '', title
            )
            SubElement(item, 'guid', isPermaLink='false').text = f'youtube:{identifier}'
            SubElement(item, 'pubDate').text = published
            SubElement(item, 'enclosure', url=f'{origin}/audio/{identifier}.mp3',
                       length=str(length), type='audio/mpeg')
        return tostring(channel_feed, encoding='utf-8', xml_declaration=True)
