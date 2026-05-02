import os
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from audit.models import AuditEvent


DEFAULT_AUDIT_EVENT_RETENTION_DAYS = 180
MINIMUM_AUDIT_EVENT_RETENTION_DAYS = 30
DEFAULT_BATCH_SIZE = 1000
MAX_BATCH_SIZE = 10000


class Command(BaseCommand):
    help = (
        "Delete audit events older than the configured retention period. "
        "Use --dry-run first to see how many rows would be deleted."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=None,
            help=(
                "Retention period in days. Defaults to settings.AUDIT_EVENT_RETENTION_DAYS "
                f"or {DEFAULT_AUDIT_EVENT_RETENTION_DAYS} days."
            ),
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=DEFAULT_BATCH_SIZE,
            help=f"Number of audit rows to delete per batch. Default: {DEFAULT_BATCH_SIZE}.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only print how many rows would be deleted. Do not delete anything.",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Actually delete old audit rows. Required unless --dry-run is used.",
        )

    def handle(self, *args, **options):
        retention_days = self._get_retention_days(options["days"])
        batch_size = self._get_batch_size(options["batch_size"])
        dry_run = options["dry_run"]
        confirmed = options["confirm"]

        if not dry_run and not confirmed:
            raise CommandError(
                "Refusing to delete audit events without --confirm. "
                "Run with --dry-run first, then run again with --confirm."
            )

        cutoff = timezone.now() - timedelta(days=retention_days)
        old_events = AuditEvent.objects.filter(created_at__lt=cutoff).order_by("id")
        old_count = old_events.count()

        self.stdout.write(
            "Audit retention policy: "
            f"delete events older than {retention_days} days "
            f"created before {cutoff.isoformat()}."
        )

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run only. {old_count} audit event(s) would be deleted."
                )
            )
            return

        deleted_count = self._delete_in_batches(old_events, batch_size=batch_size)

        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {deleted_count} audit event(s) older than {retention_days} days."
            )
        )

    def _get_retention_days(self, explicit_days):
        raw_days = explicit_days

        if raw_days is None:
            raw_days = getattr(
                settings,
                "AUDIT_EVENT_RETENTION_DAYS",
                os.getenv("AUDIT_EVENT_RETENTION_DAYS", DEFAULT_AUDIT_EVENT_RETENTION_DAYS),
            )

        try:
            retention_days = int(raw_days)
        except (TypeError, ValueError):
            raise CommandError("Audit retention days must be an integer.")

        if retention_days < MINIMUM_AUDIT_EVENT_RETENTION_DAYS:
            raise CommandError(
                "Audit retention days is too low. "
                f"Use at least {MINIMUM_AUDIT_EVENT_RETENTION_DAYS} days."
            )

        return retention_days

    def _get_batch_size(self, raw_batch_size):
        try:
            batch_size = int(raw_batch_size)
        except (TypeError, ValueError):
            raise CommandError("Batch size must be an integer.")

        if batch_size <= 0:
            raise CommandError("Batch size must be greater than zero.")

        if batch_size > MAX_BATCH_SIZE:
            raise CommandError(f"Batch size cannot exceed {MAX_BATCH_SIZE}.")

        return batch_size

    def _delete_in_batches(self, queryset, *, batch_size):
        deleted_total = 0

        while True:
            event_ids = list(queryset.values_list("id", flat=True)[:batch_size])

            if not event_ids:
                break

            deleted_count, _ = AuditEvent.objects.filter(id__in=event_ids).delete()
            deleted_total += deleted_count

        return deleted_total