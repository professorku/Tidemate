import logging
import time
import uuid

from django.conf import settings

from .services import write_audit_event

request_logger = logging.getLogger("monitoring.requests")
security_logger = logging.getLogger("security")


class RequestMonitoringMiddleware:
    """
    Adds:
    - X-Request-ID response header
    - structured request/security logs
    - automatic audit events for unsafe API writes and security-relevant responses

    It intentionally does NOT store request bodies, cookies, auth headers,
    passwords, JWTs, or CSRF tokens.
    """

    WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
    SECURITY_STATUS_CODES = {401, 403, 429}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = self._get_or_create_request_id(request)
        started_at = time.monotonic()

        try:
            response = self.get_response(request)
        except Exception:
            duration_ms = self._duration_ms(started_at)
            security_logger.exception(
                "Unhandled request exception",
                extra=self._build_log_extra(
                    request=request,
                    status_code=500,
                    duration_ms=duration_ms,
                ),
            )

            self._write_audit_event(
                request=request,
                status_code=500,
                duration_ms=duration_ms,
                forced_action="request.unhandled_exception",
            )
            raise

        duration_ms = self._duration_ms(started_at)
        status_code = getattr(response, "status_code", 0)

        response["X-Request-ID"] = request.request_id

        self._log_request(request=request, status_code=status_code, duration_ms=duration_ms)
        self._maybe_write_audit_event(request=request, status_code=status_code, duration_ms=duration_ms)

        return response

    def _get_or_create_request_id(self, request):
        incoming = request.headers.get("X-Request-ID", "").strip()

        if incoming and len(incoming) <= 64:
            return incoming

        return uuid.uuid4().hex

    def _duration_ms(self, started_at):
        return round((time.monotonic() - started_at) * 1000, 2)

    def _path_is_skipped(self, path):
        skip_prefixes = getattr(settings, "AUDIT_SKIP_PATH_PREFIXES", [])
        return any(path.startswith(prefix) for prefix in skip_prefixes)

    def _is_api_path(self, request):
        return request.path.startswith("/api/")

    def _should_audit(self, request, status_code):
        if not getattr(settings, "AUDIT_AUTOMATIC_API_EVENTS_ENABLED", True):
            return False

        if not self._is_api_path(request):
            return False

        if self._path_is_skipped(request.path):
            return False

        if request.method in self.WRITE_METHODS:
            return True

        if status_code in self.SECURITY_STATUS_CODES or status_code >= 500:
            return True

        return False

    def _status_from_status_code(self, status_code):
        if status_code in {401, 403}:
            return "denied"

        if status_code == 429:
            return "failure"

        if status_code >= 500:
            return "error"

        if status_code >= 400:
            return "failure"

        return "success"

    def _severity_from_status_code(self, status_code):
        if status_code >= 500:
            return "error"

        if status_code in {401, 403, 429}:
            return "warning"

        return "info"

    def _resolver_metadata(self, request):
        match = getattr(request, "resolver_match", None)

        if not match:
            return {
                "url_name": "",
                "view_name": "",
                "route": "",
                "kwargs": {},
            }

        view_name = ""
        if match.func:
            view_name = f"{match.func.__module__}.{getattr(match.func, '__name__', match.func.__class__.__name__)}"

        return {
            "url_name": match.url_name or "",
            "view_name": view_name,
            "route": getattr(match, "route", "") or "",
            "kwargs": dict(match.kwargs or {}),
        }

    def _action_from_request(self, request, status_code, forced_action=None):
        if forced_action:
            return forced_action

        path = request.path.rstrip("/")
        method = request.method.lower()

        explicit_actions = {
            ("POST", "/api/users/signup"): "auth.signup",
            ("POST", "/api/users/login"): "auth.login",
            ("POST", "/api/users/logout"): "auth.logout",
            ("POST", "/api/users/forgot-password"): "auth.forgot_password",
            ("POST", "/api/users/reset-password"): "auth.reset_password",
            ("POST", "/api/users/change-password"): "auth.change_password",
            ("POST", "/api/users/verify-email"): "auth.verify_email",
            ("POST", "/api/users/verify-email-change"): "auth.verify_email_change",
            ("POST", "/api/users/resend-verification"): "auth.resend_verification",
        }

        explicit_action = explicit_actions.get((request.method, path))
        if explicit_action:
            return explicit_action

        resolver_metadata = self._resolver_metadata(request)
        url_name = resolver_metadata.get("url_name") or "unnamed"

        if status_code in self.SECURITY_STATUS_CODES:
            return f"security.{status_code}"

        if status_code >= 500:
            return "request.server_error"

        return f"api.{method}.{url_name}"

    def _target_from_request(self, request):
        resolver_metadata = self._resolver_metadata(request)
        kwargs = resolver_metadata.get("kwargs") or {}

        for key in ("pk", "id", "user_id", "booking_id", "boat_id"):
            if key in kwargs:
                return key, kwargs[key]

        return resolver_metadata.get("url_name") or "", ""

    def _build_log_extra(self, *, request, status_code, duration_ms):
        actor_id = None
        user = getattr(request, "user", None)
        if user is not None and getattr(user, "is_authenticated", False):
            actor_id = user.id

        resolver_metadata = self._resolver_metadata(request)

        return {
            "request_id": getattr(request, "request_id", ""),
            "method": request.method,
            "path": request.path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "actor_id": actor_id,
            "url_name": resolver_metadata.get("url_name", ""),
            "route": resolver_metadata.get("route", ""),
        }

    def _log_request(self, *, request, status_code, duration_ms):
        if not getattr(settings, "REQUEST_MONITORING_LOG_ENABLED", True):
            return

        extra = self._build_log_extra(
            request=request,
            status_code=status_code,
            duration_ms=duration_ms,
        )

        if status_code >= 500:
            request_logger.error("api_request", extra=extra)
        elif status_code in self.SECURITY_STATUS_CODES or status_code == 429:
            security_logger.warning("security_relevant_response", extra=extra)
        elif status_code >= 400:
            request_logger.warning("api_request", extra=extra)
        else:
            request_logger.info("api_request", extra=extra)

    def _maybe_write_audit_event(self, *, request, status_code, duration_ms):
        if not self._should_audit(request, status_code):
            return

        self._write_audit_event(
            request=request,
            status_code=status_code,
            duration_ms=duration_ms,
        )

    def _write_audit_event(self, *, request, status_code, duration_ms, forced_action=None):
        target_type, target_id = self._target_from_request(request)
        resolver_metadata = self._resolver_metadata(request)

        write_audit_event(
            request=request,
            action=self._action_from_request(
                request=request,
                status_code=status_code,
                forced_action=forced_action,
            ),
            status=self._status_from_status_code(status_code),
            severity=self._severity_from_status_code(status_code),
            target_type=target_type,
            target_id=target_id,
            metadata={
                "status_code": status_code,
                "duration_ms": duration_ms,
                "url_name": resolver_metadata.get("url_name", ""),
                "route": resolver_metadata.get("route", ""),
                "method": request.method,
            },
        )