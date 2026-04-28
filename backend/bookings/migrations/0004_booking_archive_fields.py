from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_booking_cancellation_reason_max_length'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='archived_by_renter_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='booking',
            name='archived_by_host_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]