import json
import threading
from pathlib import Path
from typing import Any

from utils.structured_logging import get_logger

logger = get_logger(__name__)


class JsonStore:
    """Thread-safe JSON file read/write with atomic updates."""

    def __init__(self, file_path: str):
        self.path = Path(file_path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        if not self.path.exists():
            self._write([])

    def read_all(self) -> list[dict[str, Any]]:
        with self._lock:
            try:
                raw = self.path.read_text(encoding="utf-8")
                data = json.loads(raw) if raw.strip() else []
                return data if isinstance(data, list) else []
            except (json.JSONDecodeError, OSError) as exc:
                logger.error("json_store_read_failed", extra={"path": str(self.path), "error": str(exc)})
                raise

    def write_all(self, records: list[dict[str, Any]]) -> None:
        with self._lock:
            self._write(records)

    def _write(self, records: list[dict[str, Any]]) -> None:
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(records, indent=2, default=str), encoding="utf-8")
        tmp.replace(self.path)
