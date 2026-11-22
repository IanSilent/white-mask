"""Local preview server that tells the browser never to cache, so edits always show up."""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8792
    root = sys.argv[2] if len(sys.argv) > 2 else "."
    ThreadingHTTPServer(("127.0.0.1", port), partial(NoCacheHandler, directory=root)).serve_forever()
