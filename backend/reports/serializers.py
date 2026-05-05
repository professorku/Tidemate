from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from rest_framework import serializers

from chat.models import Message
from listings.models import BoatListing
from reviews.models import Review

from .models import MAX_REPORT_DETAILS_LENGTH, Report


User = get_user_model()


class ReportCreateSerializer(serializers.ModelSerializer):
    target_id = serializers.IntegerField(write_only=True)
    target_label = serializers.SerializerMethodField(read_only=True)
    reporter = serializers.IntegerField(source='reporter_id', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'reporter',
            'target_type',
            'target_id',
            'target_label',
            'reason',
            'details',
            'status',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'reporter',
            'target_label',
            'status',
            'created_at',
        ]

    def get_target_label(self, obj):
        if obj.target_type == Report.TargetType.LISTING and obj.listing_id:
            return obj.listing.title

        if obj.target_type == Report.TargetType.USER and obj.reported_user_id:
            return obj.reported_user.username

        if obj.target_type == Report.TargetType.REVIEW and obj.review_id:
            return f'Review by {obj.review.reviewer.username}'

        if obj.target_type == Report.TargetType.MESSAGE and obj.message_id:
            return f'Message from {obj.message.sender.username}'

        return ''

    def validate_details(self, value):
        value = (value or '').strip()

        if len(value) > MAX_REPORT_DETAILS_LENGTH:
            raise serializers.ValidationError(
                f'Details cannot be longer than {MAX_REPORT_DETAILS_LENGTH} characters.'
            )

        return value

    def validate(self, attrs):
        request = self.context['request']
        reporter = request.user
        target_type = attrs.get('target_type')
        target_id = attrs.pop('target_id', None)

        if target_id is None:
            raise serializers.ValidationError({'target_id': ['Target id is required.']})

        if target_type == Report.TargetType.LISTING:
            return self._validate_listing_report(attrs, reporter, target_id)

        if target_type == Report.TargetType.USER:
            return self._validate_user_report(attrs, reporter, target_id)

        if target_type == Report.TargetType.REVIEW:
            return self._validate_review_report(attrs, reporter, target_id)

        if target_type == Report.TargetType.MESSAGE:
            return self._validate_message_report(attrs, reporter, target_id)

        raise serializers.ValidationError({'target_type': ['Invalid report target type.']})

    def _validate_listing_report(self, attrs, reporter, target_id):
        listing = (
            BoatListing.objects
            .select_related('host')
            .filter(pk=target_id)
            .first()
        )

        if listing is None:
            raise serializers.ValidationError({'target_id': ['Listing not found.']})

        if listing.host_id == reporter.id:
            raise serializers.ValidationError({'target_id': ['You cannot report your own listing.']})

        attrs['listing'] = listing
        attrs['reported_user'] = None
        attrs['review'] = None
        attrs['message'] = None
        return attrs

    def _validate_user_report(self, attrs, reporter, target_id):
        reported_user = User.objects.filter(pk=target_id, is_active=True).first()

        if reported_user is None:
            raise serializers.ValidationError({'target_id': ['User not found.']})

        if reported_user.id == reporter.id:
            raise serializers.ValidationError({'target_id': ['You cannot report yourself.']})

        attrs['listing'] = None
        attrs['reported_user'] = reported_user
        attrs['review'] = None
        attrs['message'] = None
        return attrs

    def _validate_review_report(self, attrs, reporter, target_id):
        review = (
            Review.objects
            .select_related('reviewer', 'reviewed_user', 'boat')
            .filter(pk=target_id)
            .first()
        )

        if review is None:
            raise serializers.ValidationError({'target_id': ['Review not found.']})

        if review.reviewer_id == reporter.id:
            raise serializers.ValidationError({'target_id': ['You cannot report your own review.']})

        attrs['listing'] = None
        attrs['reported_user'] = None
        attrs['review'] = review
        attrs['message'] = None
        return attrs

    def _validate_message_report(self, attrs, reporter, target_id):
        message = (
            Message.objects
            .select_related(
                'sender',
                'conversation',
                'conversation__host',
                'conversation__renter',
            )
            .filter(pk=target_id)
            .first()
        )

        if message is None:
            raise serializers.ValidationError({'target_id': ['Message not found.']})

        if message.is_deleted:
            raise serializers.ValidationError({'target_id': ['Deleted messages cannot be reported.']})

        if message.sender_id == reporter.id:
            raise serializers.ValidationError({'target_id': ['You cannot report your own message.']})

        conversation = message.conversation
        if reporter.id not in [conversation.host_id, conversation.renter_id]:
            raise serializers.ValidationError({'target_id': ['You can only report messages in your own conversations.']})

        attrs['listing'] = None
        attrs['reported_user'] = None
        attrs['review'] = None
        attrs['message'] = message
        return attrs

    def create(self, validated_data):
        request = self.context['request']

        try:
            with transaction.atomic():
                return Report.objects.create(
                    reporter=request.user,
                    **validated_data,
                )
        except IntegrityError as exc:
            raise serializers.ValidationError({
                'detail': 'You have already reported this item. A moderator can review the existing report.'
            }) from exc