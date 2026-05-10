from django.conf import settings


def should_include_debug_link(request, header_name):
    return (
        settings.DEBUG
        and getattr(settings, "DEBUG_LINKS_ENABLED", False)
        and request.headers.get(header_name) == "1"
    )