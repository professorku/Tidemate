import os
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from payments.models import StripeEvent


DEFAULT_STRIPE_EVENT_RETENTION_DAYS = 14
MINIMUM_STRIPE_EVENT_RETENTION_DAYS = 3


class Command(BaseCommand):
    help = (
        "Delete Stripe webhook idempotency rows older than the retention period. "
        "Stripe stops retrying events after a few days, so older rows are safe to drop."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=None,
            help=(
                "Retention period in days. Defaults to STRIPE_EVENT_RETENTION_DAYS "
                f"or {DEFAULT_STRIPE_EVENT_RETENTION_DAYS} days."
            ),
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only print how many rows would be deleted.",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Actually delete old rows. Required unless --dry-run is used.",
        )

    def handle(self, *args, **options):
        days = options.get("days")
        if days is None:
            raw = os.getenv("STRIPE_EVENT_RETENTION_DAYS", "").strip()
            if raw:
                try:
                    days = int(raw)
                except ValueError:
                    raise CommandError("STRIPE_EVENT_RETENTION_DAYS must be an integer.")
            else:
                days = DEFAULT_STRIPE_EVENT_RETENTION_DAYS

        if days < MINIMUM_STRIPE_EVENT_RETENTION_DAYS:
            raise CommandError(
                f"--days must be at least {MINIMUM_STRIPE_EVENT_RETENTION_DAYS} "
                "(Stripe may still retry recent events)."
            )

        if not options["dry_run"] and not options["confirm"]:
            raise CommandError("Pass --confirm to actually delete, or --dry-run to preview.")

        cutoff = timezone.now() - timedelta(days=days)
        queryset = StripeEvent.objects.filter(received_at__lt=cutoff)

        if options["dry_run"]:
            count = queryset.count()
            self.stdout.write(f"Would delete {count} StripeEvent row(s) older than {days} days.")
            return

        deleted, _ = queryset.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} StripeEvent row(s)."))