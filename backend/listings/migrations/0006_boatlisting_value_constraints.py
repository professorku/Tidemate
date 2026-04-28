from decimal import Decimal

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0005_alter_boatlisting_options'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='boatlisting',
            constraint=models.CheckConstraint(
                condition=models.Q(guests__gte=1) & models.Q(guests__lte=100),
                name='boatlisting_guests_range',
            ),
        ),
        migrations.AddConstraint(
            model_name='boatlisting',
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(price_per_day__gte=Decimal('0.01')) &
                    models.Q(price_per_day__lte=Decimal('100000.00'))
                ),
                name='boatlisting_price_per_day_range',
            ),
        ),
        migrations.AddConstraint(
            model_name='boatlisting',
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(latitude__isnull=True) |
                    (
                        models.Q(latitude__gte=Decimal('-90.000000')) &
                        models.Q(latitude__lte=Decimal('90.000000'))
                    )
                ),
                name='boatlisting_latitude_range',
            ),
        ),
        migrations.AddConstraint(
            model_name='boatlisting',
            constraint=models.CheckConstraint(
                condition=(
                    models.Q(longitude__isnull=True) |
                    (
                        models.Q(longitude__gte=Decimal('-180.000000')) &
                        models.Q(longitude__lte=Decimal('180.000000'))
                    )
                ),
                name='boatlisting_longitude_range',
            ),
        ),
    ]