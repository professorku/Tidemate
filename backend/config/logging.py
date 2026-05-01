import json
import logging
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """
    Small JSON formatter without extra dependencies.

    Good for Render/Fly/Railway/Docker logs, and easy to ship later to
    Grafana Loki, Datadog, ELK, Sentry, etc.
    """

    RESERVED = {
        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "module",
        "msecs",
        "message",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "thread",
        "threadName",
    }

    def format(self, record):
        payload = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        for key, value in record.__dict__.items():
            if key in self.RESERVED or key.startswith("_"):
                continue

            payload[key] = self._safe_value(value)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False, default=str)

    def _safe_value(self, value):
        if isinstance(value, (str, int, float, bool)) or value is None:
            return value

        if isinstance(value, dict):
            return {str(key): self._safe_value(item) for key, item in value.items()}

        if isinstance(value, (list, tuple, set)):
            return [self._safe_value(item) for item in value]

        return str(value)