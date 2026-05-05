from django.utils import timezone
from rest_framework import serializers

from reports.models import Report


def user_payload(user):
    if not user:
        return None

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }


class ReportModerationSerializer(serializers.ModelSerializer):
    reporter = serializers.SerializerMethodField()
    target_id = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    reason_display = serializers.CharField(source='get_reason_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'reporter',
            'target_type',
            'target_id',
            'target',
            'reason',
            'reason_display',
            'details',
            'status',
            'status_display',
            'admin_notes',
            'created_at',
            'updated_at',
            'resolved_at',
        ]
        read_only_fields = [
            'id',
            'reporter',
            'target_type',
            'target_id',
            'target',
            'reason',
            'reason_display',
            'details',
            'status_display',
            'created_at',
            'updated_at',
            'resolved_at',
        ]

    def get_target_id(self, obj):
        return obj.target_object_id

    def get_target(self, obj):
        if obj.target_type == Report.TargetType.LISTING and obj.listing_id:
            return {
                'id': obj.listing.id,
                'label': obj.listing.title,
                'url': f'/boats/{obj.listing.id}',
                'owner': user_payload(obj.listing.host),
                'summary': obj.listing.description[:220],
            }

        if obj.target_type == Report.TargetType.USER and obj.reported_user_id:
            return {
                'id': obj.reported_user.id,
                'label': obj.reported_user.username,
                'url': f'/users/{obj.reported_user.id}',
                'user': user_payload(obj.reported_user),
                'summary': obj.reported_user.email,
            }

        if obj.target_type == Report.TargetType.REVIEW and obj.review_id:
            review = obj.review
            return {
                'id': review.id,
                'label': f'Review by {review.reviewer.username}',
                'url': f'/boats/{review.boat_id}',
                'reviewer': user_payload(review.reviewer),
                'reviewed_user': user_payload(review.reviewed_user),
                'boat': {
                    'id': review.boat_id,
                    'title': review.boat.title,
                },
                'rating': review.rating,
                'summary': review.comment[:220],
            }

        if obj.target_type == Report.TargetType.MESSAGE and obj.message_id:
            message = obj.message
            return {
                'id': message.id,
                'label': f'Message from {message.sender.username}',
                'url': f'/messages/{message.conversation_id}',
                'sender': user_payload(message.sender),
                'conversation_id': message.conversation_id,
                'summary': message.text[:220],
                'is_deleted': message.is_deleted,
            }

        return {
            'id': None,
            'label': 'Deleted target',
            'url': '',
            'summary': '',
        }

    def get_reporter(self, obj):
        return user_payload(obj.reporter)

    def validate_status(self, value):
        valid_statuses = {choice[0] for choice in Report.Status.choices}

        if value not in valid_statuses:
            raise serializers.ValidationError('Invalid report status.')

        return value

    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)

        instance.status = new_status
        instance.admin_notes = validated_data.get('admin_notes', instance.admin_notes)

        if new_status in {Report.Status.RESOLVED, Report.Status.DISMISSED}:
            if instance.resolved_at is None:
                instance.resolved_at = timezone.now()
        elif old_status in {Report.Status.RESOLVED, Report.Status.DISMISSED}:
            instance.resolved_at = None

        instance.save(update_fields=['status', 'admin_notes', 'resolved_at', 'updated_at'])
        return instance


class ReportModerationStatsSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    pending = serializers.IntegerField()
    reviewing = serializers.IntegerField()
    resolved = serializers.IntegerField()
    dismissed = serializers.IntegerField()
    listings = serializers.IntegerField()
    users = serializers.IntegerField()
    reviews = serializers.IntegerField()
    messages = serializers.IntegerField()