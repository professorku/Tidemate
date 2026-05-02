from django.core.management.base import BaseCommand
from django.db import transaction

from listings.models import BoatListing
from listings.services.public_coordinates import get_public_coordinate_decimals


class Command(BaseCommand):
    help = (
        'Regenerate stored privacy-safe public coordinates for all boat listings. '
        'Run this after changing LOCATION_PRIVACY_SALT or the coordinate obfuscation algorithm.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size',
            type=int,
            default=500,
            help='Number of listings to update per bulk_update call. Default: 500.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Calculate changes without writing them to the database.',
        )

    def handle(self, *args, **options):
        batch_size = max(options['batch_size'], 1)
        dry_run = options['dry_run']

        queryset = BoatListing.objects.order_by('id').only(
            'id',
            'latitude',
            'longitude',
            'public_latitude',
            'public_longitude',
        )

        pending_updates = []
        scanned_count = 0
        changed_count = 0

        def flush_updates():
            if not pending_updates:
                return

            if not dry_run:
                with transaction.atomic():
                    BoatListing.objects.bulk_update(
                        pending_updates,
                        ['public_latitude', 'public_longitude'],
                        batch_size=batch_size,
                    )

            pending_updates.clear()

        for boat in queryset.iterator(chunk_size=batch_size):
            scanned_count += 1

            public_latitude, public_longitude = get_public_coordinate_decimals(
                listing_id=boat.id,
                latitude=boat.latitude,
                longitude=boat.longitude,
            )

            if (
                boat.public_latitude == public_latitude
                and boat.public_longitude == public_longitude
            ):
                continue

            boat.public_latitude = public_latitude
            boat.public_longitude = public_longitude
            pending_updates.append(boat)
            changed_count += 1

            if len(pending_updates) >= batch_size:
                flush_updates()

        flush_updates()

        action = 'Would update' if dry_run else 'Updated'
        self.stdout.write(
            self.style.SUCCESS(
                f'{action} {changed_count} of {scanned_count} boat listing public coordinate rows.'
            )
        )