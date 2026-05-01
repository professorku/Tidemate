# Generated manually for TideMate audit logging.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AuditEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("action", models.CharField(max_length=120)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("success", "Success"),
                            ("failure", "Failure"),
                            ("denied", "Denied"),
                            ("error", "Error"),
                        ],
                        default="success",
                        max_length=20,
                    ),
                ),
                (
                    "severity",
                    models.CharField(
                        choices=[
                            ("info", "Info"),
                            ("warning", "Warning"),
                            ("error", "Error"),
                            ("critical", "Critical"),
                        ],
                        default="info",
                        max_length=20,
                    ),
                ),
                ("target_type", models.CharField(blank=True, max_length=120)),
                ("target_id", models.CharField(blank=True, max_length=120)),
                ("request_id", models.CharField(blank=True, max_length=64)),
                ("method", models.CharField(blank=True, max_length=12)),
                ("path", models.CharField(blank=True, max_length=500)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=500)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="audit_events",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["-created_at"], name="audit_audit_created_6f3f8e_idx"),
                    models.Index(fields=["actor", "-created_at"], name="audit_audit_actor_i_7c54bb_idx"),
                    models.Index(fields=["action", "-created_at"], name="audit_audit_action_ef17ea_idx"),
                    models.Index(fields=["status", "-created_at"], name="audit_audit_status_f10502_idx"),
                    models.Index(fields=["request_id"], name="audit_audit_request_44ec59_idx"),
                    models.Index(fields=["target_type", "target_id"], name="audit_audit_target__4d2b52_idx"),
                ],
            },
        ),
    ]