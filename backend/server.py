#!/usr/bin/env python3
"""
Backend minimale (zero dipendenze) per:
- Servire i file statici del progetto
- Esporre API per leggere/aggiornare scuse.txt

Sicurezza:
- Per scrivere serve header: X-Admin-Key: <ADMIN_KEY>
- Imposta ADMIN_KEY via env (consigliato) oppure modifica DEFAULT_ADMIN_KEY.
"""

from __future__ import annotations

import json
import mimetypes
import os
import re
import threading
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]  # repo root
SCUSE_PATH = ROOT / "scuse.txt"
DEFAULT_ADMIN_KEY = "change-me"

_lock = threading.Lock()


def _json(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    data = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)


def _read_scuse_raw() -> str:
    if not SCUSE_PATH.exists():
        return ""
    return SCUSE_PATH.read_text(encoding="utf-8")


def _parse_scuse(text: str) -> dict:
    """
    Ritorna:
      {
        "levels": { "1": [..], "2": [..], "3": [..] },
        "total": N
      }
    Le righe senza tag vengono messe in livello "2" (compat).
    """
    levels = {"1": [], "2": [], "3": []}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.match(r"^\[(1|2|3)\]\s*(.+)$", line)
        if m:
            levels[m.group(1)].append(m.group(2).strip())
        else:
            levels["2"].append(line)
    total = sum(len(v) for v in levels.values())
    return {"levels": levels, "total": total}


def _format_scuse(levels: dict[str, list[str]]) -> str:
    header = [
        "# Una scusa per riga.",
        "# Usa i tag [1], [2], [3] per indicare il livello di credibilità:",
        "# [1] Plausibile • [2] Molto plausibile • [3] Quasi inattaccabile",
        '# Ogni riga è già pronta da inviare: inizia con "Buongiorno capo,".',
        "# Le righe vuote e quelle che iniziano con # vengono ignorate.",
        "",
    ]
    out = header[:]
    for lvl in ("1", "2", "3"):
        for msg in levels.get(lvl, []):
            msg = (msg or "").strip()
            if not msg:
                continue
            out.append(f"[{lvl}] {msg}")
        out.append("")
    # trim trailing blanks
    while out and out[-1].strip() == "":
        out.pop()
    return "\n".join(out) + "\n"


def _validate_levels(levels: dict[str, list[str]]) -> list[str]:
    errors: list[str] = []
    for lvl in ("1", "2", "3"):
        msgs = levels.get(lvl, [])
        if not isinstance(msgs, list):
            errors.append(f"levels['{lvl}'] deve essere una lista.")
            continue
        for i, msg in enumerate(msgs):
            if not isinstance(msg, str):
                errors.append(f"levels['{lvl}'][{i}] non è una stringa.")
                continue
            s = msg.strip()
            if not s:
                errors.append(f"levels['{lvl}'][{i}] è vuota.")
            if not s.startswith("Buongiorno capo,"):
                errors.append(f"levels['{lvl}'][{i}] non inizia con 'Buongiorno capo,'.")
    # optional: enforce 50/level if all present
    for lvl in ("1", "2", "3"):
        if len(levels.get(lvl, [])) != 50:
            errors.append(f"Livello {lvl}: {len(levels.get(lvl, []))} scuse (atteso 50).")
    return errors


def _admin_key_ok(handler: BaseHTTPRequestHandler) -> bool:
    admin_key = os.environ.get("ADMIN_KEY") or DEFAULT_ADMIN_KEY
    provided = handler.headers.get("X-Admin-Key", "")
    return bool(admin_key) and provided == admin_key


class Handler(BaseHTTPRequestHandler):
    server_version = "matrix-scuse/1.0"

    def log_message(self, fmt: str, *args) -> None:
        # keep default but shorter
        super().log_message(fmt, *args)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            return _json(self, 200, {"ok": True})

        if parsed.path == "/api/excuses":
            with _lock:
                text = _read_scuse_raw()
            data = _parse_scuse(text)
            return _json(self, 200, data)

        if parsed.path == "/api/excuses/raw":
            with _lock:
                text = _read_scuse_raw()
            b = text.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers()
            self.wfile.write(b)
            return

        return self._serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/excuses":
            if not _admin_key_ok(self):
                return _json(self, 401, {"error": "Unauthorized"})

            length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(length) if length > 0 else b""
            try:
                payload = json.loads(body.decode("utf-8") or "{}")
            except Exception:
                return _json(self, 400, {"error": "Invalid JSON"})

            levels = payload.get("levels")
            if not isinstance(levels, dict):
                return _json(self, 400, {"error": "Payload must contain { levels: {1:[],2:[],3:[]} }"})

            norm = {str(k): v for k, v in levels.items()}
            errors = _validate_levels(norm)
            if errors:
                return _json(self, 400, {"error": "Validation failed", "details": errors})

            text = _format_scuse(norm)
            with _lock:
                SCUSE_PATH.write_text(text, encoding="utf-8")
            return _json(self, 200, {"ok": True, "written_to": str(SCUSE_PATH)})

        if parsed.path == "/api/excuses/raw":
            if not _admin_key_ok(self):
                return _json(self, 401, {"error": "Unauthorized"})

            length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(length) if length > 0 else b""
            text = body.decode("utf-8", errors="replace")
            data = _parse_scuse(text)
            errors = _validate_levels(data["levels"])
            if errors:
                return _json(self, 400, {"error": "Validation failed", "details": errors})
            with _lock:
                SCUSE_PATH.write_text(text if text.endswith("\n") else text + "\n", encoding="utf-8")
            return _json(self, 200, {"ok": True})

        return _json(self, 404, {"error": "Not found"})

    def do_OPTIONS(self) -> None:
        # Basic CORS for local admin usage (optional)
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,X-Admin-Key")
        self.end_headers()

    def _serve_static(self, url_path: str) -> None:
        # Map "/" -> index.html
        if url_path == "/":
            url_path = "/index.html"

        # Prevent path traversal
        safe = os.path.normpath(url_path).lstrip(os.sep)
        file_path = (ROOT / safe).resolve()
        if ROOT not in file_path.parents and file_path != ROOT:
            return _json(self, 403, {"error": "Forbidden"})

        if not file_path.exists() or not file_path.is_file():
            return _json(self, 404, {"error": "Not found"})

        ctype, _ = mimetypes.guess_type(str(file_path))
        ctype = ctype or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def main() -> None:
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8080"))
    httpd = ThreadingHTTPServer((host, port), Handler)
    print(f"Serving on http://{host}:{port}")
    print(f"Static root: {ROOT}")
    print("API:")
    print("  GET  /api/excuses")
    print("  GET  /api/excuses/raw")
    print("  POST /api/excuses        (JSON, requires X-Admin-Key)")
    print("  POST /api/excuses/raw    (text/plain body, requires X-Admin-Key)")
    httpd.serve_forever()


if __name__ == "__main__":
    main()

