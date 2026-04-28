from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0005_alter_conversation_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='archived_by_host_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name='conversation',
            name='archived_by_renter_at',
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
    ]