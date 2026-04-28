from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_devicesession'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='pending_email',
            field=models.EmailField(blank=True, db_index=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='pending_email_requested_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]