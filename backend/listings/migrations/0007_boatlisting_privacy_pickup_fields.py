from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0006_boatlisting_value_constraints'),
    ]

    operations = [
        migrations.AddField(
            model_name='boatlisting',
            name='pickup_address',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='boatlisting',
            name='pickup_instructions',
            field=models.TextField(blank=True),
        ),
    ]