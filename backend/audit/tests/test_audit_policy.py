from datetime import timedelta
from io import StringIO

from django.contrib.admin.sites import AdminSite
from django.contrib.auth.models import AnonymousUser, User
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import RequestFactory, TestCase, override_settings
from django.utils import timezone

from audit.admin import AuditEventAdmin
from audit.models import AuditEvent
from audit.services import write_audit_event


class AuditPolicyTestCase(TestCase):
    def create_audit_event(self, *, action="test.event", created_at=None):
        event = AuditEvent.objects.create(action=action)

        if created_at is not None:
            AuditEvent.objects.filter(id=event.id).update(created_at=created_at)
            event.refresh_from_db()

        return event


class AuditRetentionCommandTests(AuditPolicyTestCase):
    def test_dry_run_does_not_delete_old_events(self):
        old_event = self.create_audit_event(
            action="old.event",
            created_at=timezone.now() - timedelta(days=200),
        )
        recent_event = self.create_audit_event(
            action="recent.event",
            created_at=timezone.now() - timedelta(days=10),
        )

        stdout = StringIO()
        call_command(
            "prune_audit_events",
            "--days=180",
            "--dry-run",
            stdout=stdout,
        )

        self.assertIn("Dry run only", stdout.getvalue())
        self.assertTrue(AuditEvent.objects.filter(id=old_event.id).exists())
        self.assertTrue(AuditEvent.objects.filter(id=recent_event.id).exists())

    def test_confirm_deletes_only_events_older_than_retention_window(self):
        old_event = self.create_audit_event(
            action="old.event",
            created_at=timezone.now() - timedelta(days=200),
        )
        recent_event = self.create_audit_event(
            action="recent.event",
            created_at=timezone.now() - timedelta(days=10),
        )

        stdout = StringIO()
        call_command(
            "prune_audit_events",
            "--days=180",
            "--confirm",
            stdout=stdout,
        )

        self.assertIn("Deleted 1 audit event", stdout.getvalue())
        self.assertFalse(AuditEvent.objects.filter(id=old_event.id).exists())
        self.assertTrue(AuditEvent.objects.filter(id=recent_event.id).exists())

    def test_command_requires_confirm_unless_dry_run(self):
        self.create_audit_event(
            action="old.event",
            created_at=timezone.now() - timedelta(days=200),
        )

        with self.assertRaises(CommandError):
            call_command("prune_audit_events", "--days=180")

    def test_rejects_too_short_retention_period(self):
        with self.assertRaises(CommandError):
            call_command("prune_audit_events", "--days=7", "--dry-run")

    @override_settings(AUDIT_EVENT_RETENTION_DAYS=90)
    def test_uses_settings_retention_when_days_argument_is_omitted(self):
        old_event = self.create_audit_event(
            action="old.event",
            created_at=timezone.now() - timedelta(days=100),
        )
        recent_event = self.create_audit_event(
            action="recent.event",
            created_at=timezone.now() - timedelta(days=20),
        )

        call_command("prune_audit_events", "--confirm", stdout=StringIO())

        self.assertFalse(AuditEvent.objects.filter(id=old_event.id).exists())
        self.assertTrue(AuditEvent.objects.filter(id=recent_event.id).exists())


class AuditAdminAccessTests(AuditPolicyTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.admin = AuditEventAdmin(AuditEvent, AdminSite())
        self.audit_event = self.create_audit_event()

        self.staff_user = User.objects.create_user(
            username="audit-staff",
            password="strong-pass-123",
            is_staff=True,
        )
        self.superuser = User.objects.create_superuser(
            username="audit-superuser",
            email="superuser@example.com",
            password="strong-pass-123",
        )

    def request_for(self, user):
        request = self.factory.get("/admin/audit/auditevent/")
        request.user = user
        return request

    def test_anonymous_user_cannot_access_audit_admin(self):
        request = self.request_for(AnonymousUser())

        self.assertFalse(self.admin.has_module_permission(request))
        self.assertFalse(self.admin.has_view_permission(request, self.audit_event))
        self.assertEqual(self.admin.get_queryset(request).count(), 0)

    def test_staff_non_superuser_cannot_access_audit_admin(self):
        request = self.request_for(self.staff_user)

        self.assertFalse(self.admin.has_module_permission(request))
        self.assertFalse(self.admin.has_view_permission(request, self.audit_event))
        self.assertEqual(self.admin.get_queryset(request).count(), 0)

    def test_superuser_can_view_but_not_modify_audit_events(self):
        request = self.request_for(self.superuser)

        self.assertTrue(self.admin.has_module_permission(request))
        self.assertTrue(self.admin.has_view_permission(request, self.audit_event))
        self.assertFalse(self.admin.has_add_permission(request))
        self.assertFalse(self.admin.has_change_permission(request, self.audit_event))
        self.assertFalse(self.admin.has_delete_permission(request, self.audit_event))
        self.assertEqual(self.admin.get_queryset(request).count(), 1)


class AuditMetadataSanitizationTests(AuditPolicyTestCase):
    def test_sensitive_metadata_values_are_redacted_before_storage(self):
        with self.captureOnCommitCallbacks(execute=True):
            write_audit_event(
                action="test.sensitive_metadata",
                metadata={
                    "username_hash": "safe-correlation-id",
                    "password": "do-not-store-this",
                    "nested": {
                        "refresh_token": "do-not-store-this-either",
                        "regular_value": "safe-value",
                    },
                    "items": [
                        {
                            "api_key": "do-not-store-this-api-key",
                            "regular_value": "safe-list-value",
                        }
                    ],
                },
            )

        event = AuditEvent.objects.get(action="test.sensitive_metadata")

        self.assertEqual(event.metadata["username_hash"], "safe-correlation-id")
        self.assertEqual(event.metadata["password"], "[redacted]")
        self.assertEqual(event.metadata["nested"]["refresh_token"], "[redacted]")
        self.assertEqual(event.metadata["nested"]["regular_value"], "safe-value")
        self.assertEqual(event.metadata["items"][0]["api_key"], "[redacted]")
        self.assertEqual(event.metadata["items"][0]["regular_value"], "safe-list-value")