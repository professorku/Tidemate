from django.conf import settings
from django.db import models
from django.db.models import Q

from chat.models import Message
from listings.models import BoatListing
from reviews.models import Review


MAX_REPORT_DETAILS_LENGTH = 1000


class Report(models.Model):
    class TargetType(models.TextChoices):
        LISTING = 'listing', 'Listing'
        USER = 'user', 'User'
        REVIEW = 'review', 'Review'
        MESSAGE = 'message', 'Chat message'

    class Reason(models.TextChoices):
        SCAM = 'scam', 'Scam or fraud'
        INAPPROPRIATE = 'inappropriate', 'Inappropriate content'
        HARASSMENT = 'harassment', 'Harassment or abuse'
        SAFETY = 'safety', 'Safety concern'
        WRONG_INFO = 'wrong_info', 'Wrong or misleading information'
        SPAM = 'spam', 'Spam'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        REVIEWING = 'reviewing', 'Reviewing'
        RESOLVED = 'resolved', 'Resolved'
        DISMISSED = 'dismissed', 'Dismissed'

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_submitted',
    )

    target_type = models.CharField(max_length=20, choices=TargetType.choices)

    listing = models.ForeignKey(
        BoatListing,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports',
    )

    reported_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports_received',
    )

    review = models.ForeignKey(
        Review,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports',
    )

    message = models.ForeignKey(
        Message,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name='reports',
    )

    reason = models.CharField(max_length=40, choices=Reason.choices)
    details = models.CharField(max_length=MAX_REPORT_DETAILS_LENGTH, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at', '-id']
        indexes = [
            models.Index(fields=['target_type', 'status', '-created_at'], name='report_target_status_idx'),
            models.Index(fields=['reporter', '-created_at'], name='report_reporter_recent_idx'),
            models.Index(fields=['listing', '-created_at'], name='report_listing_recent_idx'),
            models.Index(fields=['reported_user', '-created_at'], name='report_user_recent_idx'),
            models.Index(fields=['review', '-created_at'], name='report_review_recent_idx'),
            models.Index(fields=['message', '-created_at'], name='report_message_recent_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(
                        target_type='listing',
                        listing__isnull=False,
                        reported_user__isnull=True,
                        review__isnull=True,
                        message__isnull=True,
                    ) |
                    Q(
                        target_type='user',
                        listing__isnull=True,
                        reported_user__isnull=False,
                        review__isnull=True,
                        message__isnull=True,
                    ) |
                    Q(
                        target_type='review',
                        listing__isnull=True,
                        reported_user__isnull=True,
                        review__isnull=False,
                        message__isnull=True,
                    ) |
                    Q(
                        target_type='message',
                        listing__isnull=True,
                        reported_user__isnull=True,
                        review__isnull=True,
                        message__isnull=False,
                    )
                ),
                name='report_exactly_one_matching_target',
            ),
            models.UniqueConstraint(
                fields=['reporter', 'listing'],
                condition=Q(listing__isnull=False),
                name='unique_listing_report_per_reporter',
            ),
            models.UniqueConstraint(
                fields=['reporter', 'reported_user'],
                condition=Q(reported_user__isnull=False),
                name='unique_user_report_per_reporter',
            ),
            models.UniqueConstraint(
                fields=['reporter', 'review'],
                condition=Q(review__isnull=False),
                name='unique_review_report_per_reporter',
            ),
            models.UniqueConstraint(
                fields=['reporter', 'message'],
                condition=Q(message__isnull=False),
                name='unique_message_report_per_reporter',
            ),
        ]

    def __str__(self):
        return f'{self.reporter_id} reported {self.target_type}:{self.target_object_id} ({self.status})'

    @property
    def target_object_id(self):
        if self.target_type == self.TargetType.LISTING:
            return self.listing_id

        if self.target_type == self.TargetType.USER:
            return self.reported_user_id

        if self.target_type == self.TargetType.REVIEW:
            return self.review_id

        if self.target_type == self.TargetType.MESSAGE:
            return self.message_id

        return None