from django.db import migrations, models


MAX_LENGTH = 500


def truncate_cancellation_reasons(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')

    for booking in Booking.objects.exclude(cancellation_reason=''):
        reason = booking.cancellation_reason or ''
        if len(reason) > MAX_LENGTH:
            booking.cancellation_reason = reason[:MAX_LENGTH]
            booking.save(update_fields=['cancellation_reason'])


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0002_booking_created_at_index'),
    ]

    operations = [
        migrations.RunPython(
            truncate_cancellation_reasons,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='booking',
            name='cancellation_reason',
            field=models.CharField(blank=True, max_length=500),
        ),
    ]