from rest_framework import serializers

from .constants import MAX_MESSAGE_LENGTH
from .models import Conversation, Message
from .serializer_helpers import ConversationRepresentationMixin


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    text = serializers.CharField(
        max_length=MAX_MESSAGE_LENGTH,
        allow_blank=False,
        trim_whitespace=True,
    )

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender',
            'sender_username',
            'text',
            'created_at',
            'is_read',
            'is_deleted',
            'deleted_at',
        ]
        read_only_fields = [
            'conversation',
            'sender',
            'created_at',
            'is_read',
            'is_deleted',
            'deleted_at',
        ]

    def validate_text(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError('Message text cannot be empty.')
        return value


class ConversationSerializer(ConversationRepresentationMixin, serializers.ModelSerializer):
    booking_id = serializers.SerializerMethodField()
    booking_public_id = serializers.SerializerMethodField()

    boat = serializers.SerializerMethodField()
    boat_title = serializers.SerializerMethodField()
    boat_image = serializers.SerializerMethodField()
    boat_thumbnail = serializers.SerializerMethodField()

    host_username = serializers.CharField(source='host.username', read_only=True)
    renter_username = serializers.CharField(source='renter.username', read_only=True)

    host_avatar = serializers.SerializerMethodField()
    renter_avatar = serializers.SerializerMethodField()

    start_date = serializers.SerializerMethodField()
    end_date = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()

    last_message_text = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    def get_booking_public_id(self, obj):
        booking = getattr(obj, 'booking', None)
        return booking.public_id if booking else None

    class Meta:
        model = Conversation
        fields = [
            'id',
            'conversation_type',
            'booking_id',
            'booking_public_id',
            'boat',
            'boat_title',
            'boat_image',
            'boat_thumbnail',
            'host',
            'host_username',
            'host_avatar',
            'renter',
            'renter_username',
            'renter_avatar',
            'start_date',
            'end_date',
            'total_price',
            'booking_status',
            'created_at',
            'last_message_text',
            'last_message_at',
            'unread_count',
            'message_count',
        ]