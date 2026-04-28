from decimal import Decimal

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0004_booking_archive_fields'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='booking',
            constraint=models.CheckConstraint(
                condition=models.Q(end_date__gte=models.F('start_date')),
                name='booking_end_date_on_or_after_start_date',
            ),
        ),
        migrations.AddConstraint(
            model_name='booking',
            constraint=models.CheckConstraint(
                condition=models.Q(total_price__gte=Decimal('0.01')),
                name='booking_total_price_positive',
            ),
        ),
    ]