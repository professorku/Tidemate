from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0007_direct_conversation_boat_context'),
    ]

    operations = [
        migrations.AlterModelOptions(name='message', options={'ordering': ['-created_at', '-id']}),
        migrations.AddIndex(model_name='conversation', index=models.Index(fields=['host', 'archived_by_host_at', '-created_at', '-id'], name='conv_host_visible_idx')),
        migrations.AddIndex(model_name='conversation', index=models.Index(fields=['renter', 'archived_by_renter_at', '-created_at', '-id'], name='conv_renter_visible_idx')),
        migrations.AddIndex(model_name='conversation', index=models.Index(fields=['conversation_type', 'direct_user_low', 'direct_user_high', 'boat'], name='conv_direct_lookup_idx')),
        migrations.AddIndex(model_name='message', index=models.Index(fields=['conversation', '-created_at', '-id'], name='message_conv_recent_idx')),
        migrations.AddIndex(model_name='message', index=models.Index(fields=['conversation', 'is_read', 'sender', '-created_at'], name='message_unread_lookup_idx')),
    ]
