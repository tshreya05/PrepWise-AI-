import json
import logging
import sys
import time
from contextvars import ContextVar
from typing import Any

from config import get_settings

# Trace context for correlating logs within an interview session
trace_id_var: ContextVar[str | None] = ContextVar("trace_id", default=None)


class StructuredFormatter(logging.Formatter):
    """Emit JSON or human-readable structured logs."""

    def format(self, record: logging.LogRecord) -> str:
        settings = get_settings()
        payload: dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        trace_id = trace_id_var.get()
        if trace_id:
            payload["trace_id"] = trace_id
        if hasattr(record, "extra") and isinstance(record.extra, dict):
            payload.update(record.extra)
        for key in ("latency_ms", "user_id", "interview_id", "provider", "error"):
            if hasattr(record, key):
                payload[key] = getattr(record, key)
        if settings.log_json:
            return json.dumps(payload, default=str)
        extras = {k: v for k, v in payload.items() if k not in ("timestamp", "level", "logger", "message")}
        suffix = f" | {extras}" if extras else ""
        return f"{payload['timestamp']} | {payload['level']:<8} | {payload['logger']} | {payload['message']}{suffix}"


class StructuredLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        extra = kwargs.pop("extra", {}) or {}
        if self.extra:
            extra = {**self.extra, **extra}
        kwargs["extra"] = {"extra": extra}
        return msg, kwargs


def setup_logging() -> None:
    settings = get_settings()
    root = logging.getLogger()
    root.handlers.clear()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    root.addHandler(handler)
    root.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)


def get_logger(name: str, **context: Any) -> StructuredLoggerAdapter:
    base = logging.getLogger(name)
    return StructuredLoggerAdapter(base, context)


class LatencyTracker:
    """Context manager for timing operations."""

    def __init__(self, logger: StructuredLoggerAdapter, operation: str, **fields: Any):
        self.logger = logger
        self.operation = operation
        self.fields = fields
        self.start = 0.0

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = (time.perf_counter() - self.start) * 1000
        level = logging.ERROR if exc_type else logging.INFO
        self.logger.log(
            level,
            self.operation,
            extra={**self.fields, "latency_ms": round(elapsed, 2), "error": str(exc_val) if exc_val else None},
        )
        return False
