from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('favorites', '0003_alter_favorite_options'),
    ]

    operations = [
        migrations.AddIndex(model_name='favorite', index=models.Index(fields=['user', '-created_at', '-id'], name='favorite_user_recent_idx')),
    ]
