#!/usr/bin/env python3
"""
Mini backend (zero dipendenze) per:
- servire i file statici (index.html, app.js, styles.css, scuse.txt, ...)
- esporre un'API per leggere/scrivere scuse.txt
- fornire una pagina admin per aggiornare scuse.txt dal browser

Avvio:
  python3 server.py
poi apri:
  http://127.0.0.1:8080        (sito)
  http://127.0.0.1:8080/admin  (gestione scuse)
"""

from __future__ import annotations

import json
import os
import re
import shutil
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
SCUSE_PATH = ROOT / "scuse.txt"
BACKUP_PATH = ROOT / "scuse.txt.bak"

LINE_RE = re.compile(r"^\[(1|2|3)\]\s+(.+)$")


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _write_text_atomic(path: Path, content: str) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(content, encoding="utf-8")
    tmp.replace(path)


def validate_scuse_txt(content: str) -> tuple[dict[str, int], list[str]]:
    """
    Ritorna (counts, errors).
    Valida:
    - righe commento (#) o vuote ok
    - righe scusa: devono iniziare con [1]/[2]/[3]
    - il testo deve iniziare con "Buongiorno capo,"
    """
    counts = {"1": 0, "2": 0, "3": 0}
    errors: list[str] = []

    for idx, raw in enumerate(content.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = LINE_RE.match(line)
        if not m:
            errors.append(f"Linea {idx}: formato non valido. Usa: [1] ... / [2] ... / [3] ...")
            continue
        lvl, msg = m.group(1), m.group(2).strip()
        counts[lvl] += 1
        if not msg.startswith("Buongiorno capo,"):
            errors.append(f'Linea {idx}: deve iniziare con "Buongiorno capo,"')

    return counts, errors


class Handler(BaseHTTPRequestHandler):
    server_version = "matrix-scuse/1.0"

    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self._send(status, body, "application/json; charset=utf-8")

    def _send_text(self, status: int, text: str) -> None:
        self._send(status, text.encode("utf-8"), "text/plain; charset=utf-8")

    def _serve_file(self, path: Path) -> None:
        if not path.exists() or not path.is_file():
            self._send_text(HTTPStatus.NOT_FOUND, "Not found")
            return

        ext = path.suffix.lower()
        ctype = {
            ".html": "text/html; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".txt": "text/plain; charset=utf-8",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml; charset=utf-8",
        }.get(ext, "application/octet-stream")

        data = path.read_bytes()
        self._send(HTTPStatus.OK, data, ctype)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path in ("/admin", "/admin/"):
            self._serve_file(ROOT / "admin.html")
            return

        if path == "/api/scuse":
            if not SCUSE_PATH.exists():
                self._send_json(HTTPStatus.OK, {"ok": True, "content": "", "counts": {"1": 0, "2": 0, "3": 0}})
                return
            content = _read_text(SCUSE_PATH)
            counts, errors = validate_scuse_txt(content)
            self._send_json(HTTPStatus.OK, {"ok": True, "content": content, "counts": counts, "errors": errors})
            return

        # static
        if path == "/":
            self._serve_file(ROOT / "index.html")
            return

        # prevent traversal
        rel = path.lstrip("/")
        target = (ROOT / rel).resolve()
        if ROOT not in target.parents and target != ROOT:
            self._send_text(HTTPStatus.FORBIDDEN, "Forbidden")
            return

        self._serve_file(target)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/scuse":
            self._send_text(HTTPStatus.NOT_FOUND, "Not found")
            return

        length = int(self.headers.get("Content-Length", "0") or "0")
        raw = self.rfile.read(length) if length > 0 else b""

        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Body JSON non valido"})
            return

        content = payload.get("content")
        if not isinstance(content, str):
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": 'Campo "content" mancante o non stringa'})
            return

        # normalize newlines + trim trailing whitespace per-line
        normalized_lines = [ln.rstrip() for ln in content.replace("\r\n", "\n").replace("\r", "\n").split("\n")]
        normalized = "\n".join(normalized_lines).rstrip() + "\n"

        counts, errors = validate_scuse_txt(normalized)
        if errors:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Validazione fallita", "counts": counts, "errors": errors})
            return

        # backup
        try:
            if SCUSE_PATH.exists():
                shutil.copyfile(SCUSE_PATH, BACKUP_PATH)
        except Exception:
            # backup non bloccante
            pass

        try:
            _write_text_atomic(SCUSE_PATH, normalized)
        except Exception as e:
            self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": f"Impossibile scrivere scuse.txt: {e}"})
            return

        self._send_json(HTTPStatus.OK, {"ok": True, "counts": counts})

    def log_message(self, fmt: str, *args) -> None:
        # log compatto
        return


def main() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8080"))
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port} (admin: /admin)")
    httpd.serve_forever()


if __name__ == "__main__":
    main()

