from django.db import migrations, models
from django.db.models import F, Q


def delete_invalid_same_day_bookings(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')

    Booking.objects.filter(
        end_date__lte=F('start_date')
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0006_booking_expires_at'),
    ]

    operations = [
        migrations.RunPython(
            delete_invalid_same_day_bookings,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.RemoveConstraint(
            model_name='booking',
            name='booking_end_date_on_or_after_start_date',
        ),
        migrations.AddConstraint(
            model_name='booking',
            constraint=models.CheckConstraint(
                condition=Q(end_date__gt=F('start_date')),
                name='booking_end_date_after_start_date',
            ),
        ),
    ]