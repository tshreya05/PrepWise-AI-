"""Backward-compatible logging entry point."""
from utils.structured_logging import setup_logging, get_logger, LatencyTracker, trace_id_var

__all__ = ["setup_logging", "get_logger", "LatencyTracker", "trace_id_var"]
