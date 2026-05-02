from django.contrib import admin

from .models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    """
    Audit logs may contain personal data such as IP addresses, user agents,
    request paths, actor identifiers, and target identifiers.

    Policy:
    - only superusers can see audit events in Django admin
    - audit events are read-only in admin
    - manual admin deletion is disabled; retention cleanup must use the
      prune_audit_events management command so deletion is consistent and auditable
    """

    list_display = (
        "created_at",
        "action",
        "status",
        "severity",
        "actor",
        "target_type",
        "target_id",
        "ip_address",
        "request_id",
    )
    list_filter = ("status", "severity", "action", "created_at")
    search_fields = (
        "action",
        "target_type",
        "target_id",
        "request_id",
        "path",
        "ip_address",
        "actor__username",
        "actor__email",
    )
    readonly_fields = (
        "created_at",
        "actor",
        "action",
        "status",
        "severity",
        "target_type",
        "target_id",
        "request_id",
        "method",
        "path",
        "ip_address",
        "user_agent",
        "metadata",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    fieldsets = (
        (
            "Event",
            {
                "fields": (
                    "created_at",
                    "action",
                    "status",
                    "severity",
                )
            },
        ),
        (
            "Actor and target",
            {
                "fields": (
                    "actor",
                    "target_type",
                    "target_id",
                )
            },
        ),
        (
            "Request metadata",
            {
                "fields": (
                    "request_id",
                    "method",
                    "path",
                    "ip_address",
                    "user_agent",
                )
            },
        ),
        (
            "Sanitized metadata",
            {
                "fields": ("metadata",),
                "description": (
                    "Metadata is sanitized before storage. Request bodies, cookies, "
                    "authorization headers, CSRF tokens, passwords, access tokens, "
                    "refresh tokens, secrets, and API keys must not be stored here."
                ),
            },
        ),
    )

    def _is_superuser(self, request):
        user = getattr(request, "user", None)
        return bool(user and user.is_active and user.is_superuser)

    def has_module_permission(self, request):
        return self._is_superuser(request)

    def has_view_permission(self, request, obj=None):
        return self._is_superuser(request)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        if not self._is_superuser(request):
            return queryset.none()

        return queryset