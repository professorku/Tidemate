from django.conf import settings
from django.db import models


class AuditEvent(models.Model):
    class Status(models.TextChoices):
        SUCCESS = "success", "Success"
        FAILURE = "failure", "Failure"
        DENIED = "denied", "Denied"
        ERROR = "error", "Error"

    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        ERROR = "error", "Error"
        CRITICAL = "critical", "Critical"

    created_at = models.DateTimeField(auto_now_add=True)

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_events",
    )

    action = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.INFO)

    target_type = models.CharField(max_length=120, blank=True)
    target_id = models.CharField(max_length=120, blank=True)

    request_id = models.CharField(max_length=64, blank=True)
    method = models.CharField(max_length=12, blank=True)
    path = models.CharField(max_length=500, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["actor", "-created_at"]),
            models.Index(fields=["action", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["request_id"]),
            models.Index(fields=["target_type", "target_id"]),
        ]

    def __str__(self):
        actor = self.actor_id if self.actor_id else "anonymous"
        return f"{self.created_at:%Y-%m-%d %H:%M:%S} {self.action} {self.status} actor={actor}"