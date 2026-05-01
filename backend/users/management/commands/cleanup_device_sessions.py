from django.core.management.base import BaseCommand, CommandError

from users.device_tracking import (
    cleanup_old_device_sessions,
    get_old_device_sessions_queryset,
)


class Command(BaseCommand):
    help = "Delete revoked or expired device sessions older than the retention period."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=90,
            help="Retention period in days. Default: 90.",
        )

        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many rows would be deleted without deleting them.",
        )

    def handle(self, *args, **options):
        retention_days = options["days"]
        dry_run = options["dry_run"]

        if retention_days < 1:
            raise CommandError("--days must be at least 1.")

        queryset = get_old_device_sessions_queryset(retention_days=retention_days)
        count = queryset.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {count} old device session(s) would be deleted."
                )
            )
            return

        deleted_count, deleted_by_model = cleanup_old_device_sessions(
            retention_days=retention_days,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {deleted_count} old device session object(s): {deleted_by_model}"
            )
        )