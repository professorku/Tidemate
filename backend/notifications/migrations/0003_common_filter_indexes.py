from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0002_notification_created_at_index'),
    ]

    operations = [
        migrations.AlterModelOptions(name='notification', options={'ordering': ['-created_at', '-id']}),
        migrations.AddIndex(model_name='notification', index=models.Index(fields=['user', '-created_at', '-id'], name='notif_user_recent_idx')),
        migrations.AddIndex(model_name='notification', index=models.Index(fields=['user', 'is_read', '-created_at', '-id'], name='notif_user_unread_idx')),
    ]
