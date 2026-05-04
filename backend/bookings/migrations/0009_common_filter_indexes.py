from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0008_booking_public_id'),
    ]

    operations = [
        migrations.AddIndex(model_name='booking', index=models.Index(fields=['renter', 'archived_by_renter_at', '-created_at', '-id'], name='booking_renter_visible_idx')),
        migrations.AddIndex(model_name='booking', index=models.Index(fields=['boat', 'archived_by_host_at', 'status', '-created_at', '-id'], name='booking_boat_host_status_idx')),
        migrations.AddIndex(model_name='booking', index=models.Index(fields=['boat', 'status', 'start_date', 'end_date'], name='booking_boat_status_dates_idx')),
        migrations.AddIndex(model_name='booking', index=models.Index(fields=['status', 'expires_at'], name='booking_status_expires_idx')),
    ]
