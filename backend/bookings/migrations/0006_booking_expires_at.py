from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0005_booking_value_constraints'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='expires_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]