from django.core.management.base import BaseCommand
from django.utils import timezone

from bookings.expiry import expire_pending_bookings


class Command(BaseCommand):
    help = 'Expire pending booking requests whose expiry time has passed.'

    def handle(self, *args, **options):
        expired_count = expire_pending_bookings(now=timezone.now())
        self.stdout.write(
            self.style.SUCCESS(f'Expired {expired_count} pending booking request(s).')
        )