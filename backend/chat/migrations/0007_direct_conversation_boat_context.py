import django.db.models.deletion
from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '006_conversation_archive_fields'),
        ('listings', '0010_add_more_boat_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='conversation',
            name='boat',
            field=models.ForeignKey(
                blank=True,
                help_text='Boat context for direct listing inquiries.',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='direct_conversations',
                to='listings.boatlisting',
            ),
        ),
        migrations.RemoveConstraint(
            model_name='conversation',
            name='unique_direct_conversation_participants',
        ),
        migrations.AddConstraint(
            model_name='conversation',
            constraint=models.UniqueConstraint(
                fields=['conversation_type', 'direct_user_low', 'direct_user_high'],
                condition=Q(conversation_type='direct', boat__isnull=True),
                name='unique_direct_conversation_participants_no_boat',
            ),
        ),
        migrations.AddConstraint(
            model_name='conversation',
            constraint=models.UniqueConstraint(
                fields=['conversation_type', 'direct_user_low', 'direct_user_high', 'boat'],
                condition=Q(conversation_type='direct', boat__isnull=False),
                name='unique_direct_conversation_participants_boat',
            ),
        ),
    ]