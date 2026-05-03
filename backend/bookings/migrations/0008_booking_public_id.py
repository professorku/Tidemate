import secrets

from django.db import migrations, models
import bookings.models


BOOKING_PUBLIC_ID_PREFIX = 'TM-'
BOOKING_PUBLIC_ID_RANDOM_LENGTH = 8
BOOKING_PUBLIC_ID_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'


def generate_public_id():
    random_part = ''.join(
        secrets.choice(BOOKING_PUBLIC_ID_ALPHABET)
        for _ in range(BOOKING_PUBLIC_ID_RANDOM_LENGTH)
    )
    return f'{BOOKING_PUBLIC_ID_PREFIX}{random_part}'


def populate_public_ids(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')
    db_alias = schema_editor.connection.alias

    for booking in Booking.objects.using(db_alias).filter(public_id__isnull=True).iterator():
        public_id = generate_public_id()

        while Booking.objects.using(db_alias).filter(public_id=public_id).exists():
            public_id = generate_public_id()

        booking.public_id = public_id
        booking.save(update_fields=['public_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0007_booking_end_date_after_start_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='public_id',
            field=models.CharField(
                blank=True,
                editable=False,
                max_length=11,
                null=True,
                unique=True,
            ),
        ),
        migrations.RunPython(populate_public_ids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='booking',
            name='public_id',
            field=models.CharField(
                default=bookings.models.generate_booking_public_id,
                editable=False,
                max_length=11,
                unique=True,
            ),
        ),
    ]