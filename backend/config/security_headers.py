from django.conf import settings


CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy"
CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only"


def _normalize_directive_values(values):
    if values is True:
        return ""

    if values in (None, False):
        return None

    if isinstance(values, str):
        return values.strip()

    return " ".join(str(value).strip() for value in values if str(value).strip())


def build_content_security_policy_header(policy):
    directives = []

    for directive, values in policy.items():
        normalized_values = _normalize_directive_values(values)

        if normalized_values is None:
            continue

        if normalized_values:
            directives.append(f"{directive} {normalized_values}")
        else:
            directives.append(directive)

    return "; ".join(directives)


class ContentSecurityPolicyMiddleware:
    """
    Adds a Content Security Policy header to Django responses.

    The React frontend should still be served with its own CSP header by the
    frontend host/reverse proxy. This middleware protects Django-served pages,
    API responses, browsable API pages, and the admin if enabled.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if not getattr(settings, "CSP_ENABLED", True):
            return response

        policy = getattr(settings, "CSP_POLICY", None)
        if not policy:
            return response

        header_name = (
            CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER
            if getattr(settings, "CSP_REPORT_ONLY", False)
            else CONTENT_SECURITY_POLICY_HEADER
        )

        if response.has_header(header_name):
            return response

        response[header_name] = build_content_security_policy_header(policy)
        return response