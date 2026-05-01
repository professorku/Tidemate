from django.contrib import admin

from .models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
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

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False