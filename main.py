
import os
import sys
import shutil
import webbrowser
from pathlib import Path
from textwrap import dedent
from threading import Thread
from http.server import HTTPServer, BaseHTTPRequestHandler


USAGE = f'''
    USAGE: python3 {sys.argv[0]} file.map [output.html]

        Show graphical binary size report from provided map file.

        If "output.html" is not provided, the script will create a HTTP server
        to serve the result for the browser.

        The result will be shown in the browser window. You can control which
        browser you want to use by setting a "BROWSER" environment variable.
'''


class MyHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == '/':
            mime = 'text/html; charset=utf-8'
            file = Path(__file__).with_suffix('.html')
        elif (self.path == '/input.map') and (input_map.exists()):
            mime = 'text/plain'
            file = input_map
        elif self.path == '/shutdown':
            thread = Thread(target=lambda s: s.shutdown(), args=(self.server, ))
            thread.daemon = True
            thread.start()
            mime = 'text/plain'
            file = b'OK'
        else:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-type', mime)
        self.send_header('Pragma', 'no-cache')
        self.send_header('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate')
        self.end_headers()
        if isinstance(file, Path):
            with open(file, 'rb') as fd:
                shutil.copyfileobj(fd, self.wfile)
        else:
            self.wfile.write(file)

    def log_message(self, format, *args, **kwargs):
        pass


def main():
    global input_map

    if len(sys.argv) < 2:
        print(dedent(USAGE))
        return 1

    input_map = Path(sys.argv[1])

    if len(sys.argv) < 3:
        with HTTPServer(('localhost', 0), MyHTTPRequestHandler) as server: # TODO: using constant port allows permanent user configuration
            webbrowser.open(f'http://localhost:{server.server_port}/')
            server.serve_forever()
    else:
        file = Path(__file__).with_suffix('.html').read_bytes()
        data = input_map.read_bytes()
        data = data.replace(b'\\', b'\\\\').replace(b'`', b'\`').replace(b'$', b'\$').replace(b'</script', b'</`+`script')
        file = file.replace(b'</body>', b'<script>\nwindow._preloadedMap = `' + data + b'`;\n</script></body>')
        with open(sys.argv[2], 'wb') as fd:
            fd.write(file)
        webbrowser.open(f'file:///' + str(Path(sys.argv[2]).resolve()).replace(os.pathsep, '/'))

exit(main() or 0)
