from django.conf import settings


CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy"
CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only"
PERMISSIONS_POLICY_HEADER = "Permissions-Policy"


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


def build_permissions_policy_header(policy):

    directives = []

    for feature, allowlist in policy.items():
        if not allowlist:
            directives.append(f"{feature}=()")
        else:
            origins = " ".join(str(o) for o in allowlist)
            directives.append(f"{feature}=({origins})")

    return ", ".join(directives)


class ContentSecurityPolicyMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self._add_csp_header(response)
        self._add_permissions_policy_header(response)
        return response

    def _add_csp_header(self, response):
        if not getattr(settings, "CSP_ENABLED", True):
            return

        policy = getattr(settings, "CSP_POLICY", None)
        if not policy:
            return

        header_name = (
            CONTENT_SECURITY_POLICY_REPORT_ONLY_HEADER
            if getattr(settings, "CSP_REPORT_ONLY", False)
            else CONTENT_SECURITY_POLICY_HEADER
        )

        if response.has_header(header_name):
            return

        response[header_name] = build_content_security_policy_header(policy)

    def _add_permissions_policy_header(self, response):
        policy = getattr(settings, "PERMISSIONS_POLICY", None)
        if not policy:
            return

        if response.has_header(PERMISSIONS_POLICY_HEADER):
            return

        response[PERMISSIONS_POLICY_HEADER] = build_permissions_policy_header(policy)