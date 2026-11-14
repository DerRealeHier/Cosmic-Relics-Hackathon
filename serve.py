#!/usr/bin/env python3
"""Local HTTP server for Silent Monuments of Space (Moon, Mars & Deep Space).

Serves static files from the repository directory with explicit MIME types
(including ``model/gltf-binary`` for ``.glb``) so browsers can load NASA SVS
14959 without ``file://`` CORS restrictions.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import pathlib
import socket
import socketserver
import webbrowser


class SpaceExplorerHandler(http.server.SimpleHTTPRequestHandler):
    """Static file handler configured for 3D glTF binary assets."""

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.glb': 'model/gltf-binary',
        '.gltf': 'model/gltf+json',
        '.svg': 'image/svg+xml',
        '.mjs': 'application/javascript',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.html': 'text/html; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
    }

    def copyfile(self, source, outputfile) -> None:
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass


def pick_port(preferred: int) -> int:
    for candidate in [preferred, 8080, 8081, 3000, 0]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', candidate))
                return s.getsockname()[1]
            except OSError:
                continue
    return preferred


def main() -> None:
    parser = argparse.ArgumentParser(
        description='Serve Silent Monuments of Space locally.'
    )
    parser.add_argument(
        '--port',
        type=int,
        default=8000,
        help='Preferred port on localhost (default: 8000).',
    )
    parser.add_argument(
        '--no-browser',
        action='store_true',
        help='Do not automatically open the web browser on startup.',
    )
    args = parser.parse_args()

    root = pathlib.Path(__file__).resolve().parent
    handler = functools.partial(SpaceExplorerHandler, directory=os.fspath(root))
    port = pick_port(args.port)

    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), handler) as httpd:
        bound_port = httpd.server_address[1]
        url = f'http://127.0.0.1:{bound_port}/index.html'
        print(f'Serving Silent Monuments of Space at {url}', flush=True)
        print('Press Ctrl+C to stop.', flush=True)
        if not args.no_browser:
            webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print('\nServer stopped.')


if __name__ == '__main__':
    main()
