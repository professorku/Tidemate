from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0009_common_filter_indexes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('awaiting_payment', 'Awaiting payment'),
                    ('confirmed', 'Confirmed'),
                    ('cancelled', 'Cancelled'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
