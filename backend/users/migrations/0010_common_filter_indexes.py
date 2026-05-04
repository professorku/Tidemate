from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_googleaccount'),
    ]

    operations = [
        migrations.AddIndex(model_name='devicesession', index=models.Index(fields=['user', '-last_used_at', '-id'], name='device_user_recent_idx')),
        migrations.AddIndex(model_name='devicesession', index=models.Index(fields=['user', 'revoked_at', 'expires_at'], name='device_user_active_idx')),
    ]
