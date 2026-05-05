import logging
import os
import signal
import time
from dataclasses import dataclass
from datetime import datetime, timedelta

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

from bookings.expiry import expire_pending_bookings

logger = logging.getLogger(__name__)

DEFAULT_BOOKING_EXPIRY_INTERVAL_SECONDS = 5 * 60
DEFAULT_AUDIT_PRUNE_INTERVAL_SECONDS = 24 * 60 * 60
DEFAULT_AUDIT_PRUNE_STARTUP_DELAY_SECONDS = 60
MIN_INTERVAL_SECONDS = 60
LOOP_SLEEP_SECONDS = 5


@dataclass
class ScheduledTask:
    name: str
    interval_seconds: int
    next_run_at: datetime

    def is_due(self, now):
        return now >= self.next_run_at

    def schedule_next_run(self, now):
        self.next_run_at = now + timedelta(seconds=self.interval_seconds)


def get_env_int(name, default):
    raw_value = os.getenv(name, str(default)).strip()

    try:
        return int(raw_value)
    except ValueError:
        raise CommandError(f"{name} must be an integer.")


def get_positive_interval(name, default):
    value = get_env_int(name, default)

    if value < MIN_INTERVAL_SECONDS:
        raise CommandError(f"{name} must be at least {MIN_INTERVAL_SECONDS} seconds.")

    return value


class Command(BaseCommand):
    help = "Run periodic production maintenance tasks for bookings and audit logs."

    def add_arguments(self, parser):
        parser.add_argument(
            "--once",
            action="store_true",
            help="Run enabled maintenance tasks once and exit.",
        )
        parser.add_argument(
            "--booking-interval-seconds",
            type=int,
            default=None,
            help=(
                "How often to expire pending bookings. Defaults to "
                "MAINTENANCE_BOOKING_EXPIRY_INTERVAL_SECONDS or 300 seconds."
            ),
        )
        parser.add_argument(
            "--audit-interval-seconds",
            type=int,
            default=None,
            help=(
                "How often to prune old audit events. Defaults to "
                "MAINTENANCE_AUDIT_PRUNE_INTERVAL_SECONDS or 86400 seconds."
            ),
        )
        parser.add_argument(
            "--audit-startup-delay-seconds",
            type=int,
            default=None,
            help=(
                "Delay before the first audit prune run. Defaults to "
                "MAINTENANCE_AUDIT_PRUNE_STARTUP_DELAY_SECONDS or 60 seconds."
            ),
        )
        parser.add_argument(
            "--audit-retention-days",
            type=int,
            default=None,
            help=(
                "Audit event retention in days. Defaults to AUDIT_EVENT_RETENTION_DAYS "
                "or the prune_audit_events command default."
            ),
        )
        parser.add_argument(
            "--audit-batch-size",
            type=int,
            default=None,
            help="Audit prune batch size. Defaults to the prune_audit_events command default.",
        )
        parser.add_argument(
            "--skip-booking-expiry",
            action="store_true",
            help="Do not run pending booking expiry.",
        )
        parser.add_argument(
            "--skip-audit-prune",
            action="store_true",
            help="Do not run audit event pruning.",
        )

    def handle(self, *args, **options):
        self._stop_requested = False
        signal.signal(signal.SIGTERM, self._request_stop)
        signal.signal(signal.SIGINT, self._request_stop)

        if options["skip_booking_expiry"] and options["skip_audit_prune"]:
            raise CommandError("At least one maintenance task must be enabled.")

        if options["once"]:
            self._run_once(options)
            return

        tasks = self._build_tasks(options)
        task_names = ", ".join(task.name for task in tasks)
        self.stdout.write(self.style.SUCCESS(f"Scheduled maintenance started: {task_names}."))

        while not self._stop_requested:
            now = timezone.now()

            for task in tasks:
                if not task.is_due(now):
                    continue

                self._run_task(task.name, options)
                task.schedule_next_run(timezone.now())

            time.sleep(LOOP_SLEEP_SECONDS)

        self.stdout.write(self.style.WARNING("Scheduled maintenance stopped."))

    def _request_stop(self, signum, frame):
        self._stop_requested = True

    def _run_once(self, options):
        self.stdout.write("Running maintenance tasks once.")

        if not options["skip_booking_expiry"]:
            self._run_expire_pending_bookings()

        if not options["skip_audit_prune"]:
            self._run_prune_audit_events(options)

    def _build_tasks(self, options):
        now = timezone.now()
        tasks = []

        if not options["skip_booking_expiry"]:
            booking_interval = options["booking_interval_seconds"]
            if booking_interval is None:
                booking_interval = get_positive_interval(
                    "MAINTENANCE_BOOKING_EXPIRY_INTERVAL_SECONDS",
                    DEFAULT_BOOKING_EXPIRY_INTERVAL_SECONDS,
                )
            elif booking_interval < MIN_INTERVAL_SECONDS:
                raise CommandError(
                    f"--booking-interval-seconds must be at least {MIN_INTERVAL_SECONDS}."
                )

            tasks.append(
                ScheduledTask(
                    name="expire_pending_bookings",
                    interval_seconds=booking_interval,
                    next_run_at=now,
                )
            )

        if not options["skip_audit_prune"]:
            audit_interval = options["audit_interval_seconds"]
            if audit_interval is None:
                audit_interval = get_positive_interval(
                    "MAINTENANCE_AUDIT_PRUNE_INTERVAL_SECONDS",
                    DEFAULT_AUDIT_PRUNE_INTERVAL_SECONDS,
                )
            elif audit_interval < MIN_INTERVAL_SECONDS:
                raise CommandError(
                    f"--audit-interval-seconds must be at least {MIN_INTERVAL_SECONDS}."
                )

            audit_startup_delay = options["audit_startup_delay_seconds"]
            if audit_startup_delay is None:
                audit_startup_delay = get_env_int(
                    "MAINTENANCE_AUDIT_PRUNE_STARTUP_DELAY_SECONDS",
                    DEFAULT_AUDIT_PRUNE_STARTUP_DELAY_SECONDS,
                )
            if audit_startup_delay < 0:
                raise CommandError("Audit startup delay cannot be negative.")

            tasks.append(
                ScheduledTask(
                    name="prune_audit_events",
                    interval_seconds=audit_interval,
                    next_run_at=now + timedelta(seconds=audit_startup_delay),
                )
            )

        return tasks

    def _run_task(self, task_name, options):
        try:
            if task_name == "expire_pending_bookings":
                self._run_expire_pending_bookings()
                return

            if task_name == "prune_audit_events":
                self._run_prune_audit_events(options)
                return

            raise CommandError(f"Unknown maintenance task: {task_name}")
        except Exception as exc:
            logger.exception("Scheduled maintenance task failed: %s", task_name)
            self.stderr.write(
                self.style.ERROR(f"Maintenance task failed: {task_name}: {exc}")
            )

    def _run_expire_pending_bookings(self):
        expired_count = expire_pending_bookings(now=timezone.now())
        self.stdout.write(
            self.style.SUCCESS(
                f"Expired {expired_count} pending booking request(s)."
            )
        )

    def _run_prune_audit_events(self, options):
        command_options = {
            "confirm": True,
            "stdout": self.stdout,
            "stderr": self.stderr,
        }

        audit_retention_days = options.get("audit_retention_days")
        if audit_retention_days is None:
            raw_retention_days = os.getenv("AUDIT_EVENT_RETENTION_DAYS", "").strip()
            if raw_retention_days:
                try:
                    audit_retention_days = int(raw_retention_days)
                except ValueError:
                    raise CommandError("AUDIT_EVENT_RETENTION_DAYS must be an integer.")

        if audit_retention_days is not None:
            command_options["days"] = audit_retention_days

        audit_batch_size = options.get("audit_batch_size")
        if audit_batch_size is None:
            raw_batch_size = os.getenv("MAINTENANCE_AUDIT_PRUNE_BATCH_SIZE", "").strip()
            if raw_batch_size:
                try:
                    audit_batch_size = int(raw_batch_size)
                except ValueError:
                    raise CommandError("MAINTENANCE_AUDIT_PRUNE_BATCH_SIZE must be an integer.")

        if audit_batch_size is not None:
            command_options["batch_size"] = audit_batch_size

        call_command("prune_audit_events", **command_options)