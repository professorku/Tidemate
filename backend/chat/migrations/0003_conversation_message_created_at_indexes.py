from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0002_message_soft_delete_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="conversation",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
        migrations.AlterField(
            model_name="message",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, db_index=True),
        ),
    ]
