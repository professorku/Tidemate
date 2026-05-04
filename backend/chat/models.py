from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q

from bookings.models import Booking
from listings.models import BoatListing


class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ('booking', 'Booking'),
        ('direct', 'Direct'),
    )

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='conversation',
        null=True,
        blank=True,
    )
    boat = models.ForeignKey(
        BoatListing,
        on_delete=models.SET_NULL,
        related_name='direct_conversations',
        null=True,
        blank=True,
        help_text='Boat context for direct listing inquiries.',
    )
    host = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='host_conversations'
    )
    renter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='renter_conversations'
    )
    conversation_type = models.CharField(
        max_length=20,
        choices=CONVERSATION_TYPES,
        default='booking',
    )
    direct_user_low = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='direct_conversations_low',
        null=True,
        blank=True,
    )
    direct_user_high = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='direct_conversations_high',
        null=True,
        blank=True,
    )

    archived_by_host_at = models.DateTimeField(blank=True, null=True, db_index=True)
    archived_by_renter_at = models.DateTimeField(blank=True, null=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at', '-id']
        constraints = [
            models.UniqueConstraint(
                fields=['conversation_type', 'direct_user_low', 'direct_user_high'],
                condition=Q(conversation_type='direct', boat__isnull=True),
                name='unique_direct_conversation_participants_no_boat',
            ),
            models.UniqueConstraint(
                fields=['conversation_type', 'direct_user_low', 'direct_user_high', 'boat'],
                condition=Q(conversation_type='direct', boat__isnull=False),
                name='unique_direct_conversation_participants_boat',
            ),
        ]

    def save(self, *args, **kwargs):
        if self.conversation_type == 'direct' and self.host_id and self.renter_id:
            user_ids = sorted([self.host_id, self.renter_id])
            self.direct_user_low_id = user_ids[0]
            self.direct_user_high_id = user_ids[1]
        else:
            self.direct_user_low = None
            self.direct_user_high = None
            self.boat = None

        super().save(*args, **kwargs)

    def __str__(self):
        if self.booking_id:
            return f"Booking conversation {self.booking_id}"

        if self.boat_id:
            return f"Direct conversation {self.id} about {self.boat}"

        return f"Direct conversation {self.id}"


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_read = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        if self.is_deleted:
            return f"{self.sender.username}: [deleted]"
        return f"{self.sender.username}: {self.text[:30]}"