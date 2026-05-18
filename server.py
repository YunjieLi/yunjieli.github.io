#!/usr/bin/env python3
import http.server
import socketserver
import os

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None):
        if code == 404:
            # Try to serve 404.html
            error_path = self.path
            self.path = '/404.html'
            try:
                f = self.send_head()
                if f:
                    # Send 404 status but with 404.html content
                    self.send_response(404)
                    self.send_header('Content-type', self.guess_type('/404.html'))
                    fs = os.fstat(f.fileno())
                    self.send_header('Content-Length', str(fs[6]))
                    self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
                    self.end_headers()
                    self.copyfile(f, self.wfile)
                    f.close()
                    return
            except (IOError, OSError):
                self.path = error_path
        # Fall back to default error handling
        super().send_error(code, message)

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", 8000))

with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
    print(f"Server running at http://localhost:{PORT}/")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()

