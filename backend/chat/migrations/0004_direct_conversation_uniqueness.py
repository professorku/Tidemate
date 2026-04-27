from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def populate_and_dedupe_direct_conversations(apps, schema_editor):
    Conversation = apps.get_model("chat", "Conversation")
    Message = apps.get_model("chat", "Message")

    direct_conversations = Conversation.objects.filter(conversation_type="direct").order_by("created_at", "id")
    keepers = {}

    for conversation in direct_conversations:
        participant_ids = tuple(sorted([conversation.host_id, conversation.renter_id]))
        keeper = keepers.get(participant_ids)

        if keeper is None:
            conversation.direct_user_low_id = participant_ids[0]
            conversation.direct_user_high_id = participant_ids[1]
            conversation.save(update_fields=["direct_user_low", "direct_user_high"])
            keepers[participant_ids] = conversation
            continue

        Message.objects.filter(conversation_id=conversation.id).update(conversation_id=keeper.id)
        conversation.delete()


def clear_direct_conversation_participants(apps, schema_editor):
    Conversation = apps.get_model("chat", "Conversation")
    Conversation.objects.update(direct_user_low=None, direct_user_high=None)


class Migration(migrations.Migration):

    dependencies = [
        ("chat", "0003_conversation_message_created_at_indexes"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="conversation",
            name="direct_user_high",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="direct_conversations_high", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="conversation",
            name="direct_user_low",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="direct_conversations_low", to=settings.AUTH_USER_MODEL),
        ),
        migrations.RunPython(populate_and_dedupe_direct_conversations, clear_direct_conversation_participants),
        migrations.AddConstraint(
            model_name="conversation",
            constraint=models.UniqueConstraint(condition=models.Q(("conversation_type", "direct")), fields=("conversation_type", "direct_user_low", "direct_user_high"), name="unique_direct_conversation_participants"),
        ),
    ]
