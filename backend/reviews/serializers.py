from datetime import datetime, time

from django.utils import timezone
from rest_framework import serializers

from .models import Review, MAX_REVIEW_COMMENT_LENGTH


BOOKING_RETURN_TIME = time(hour=12, minute=0)


def get_booking_return_datetime(booking):
    naive_datetime = datetime.combine(booking.end_date, BOOKING_RETURN_TIME)
    return timezone.make_aware(naive_datetime, timezone.get_current_timezone())


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    reviewed_username = serializers.CharField(source='reviewed_user.username', read_only=True)
    boat_title = serializers.CharField(source='boat.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'boat',
            'boat_title',
            'reviewer',
            'reviewer_username',
            'reviewed_user',
            'reviewed_username',
            'review_type',
            'role',
            'rating',
            'comment',
            'created_at',
        ]
        read_only_fields = [
            'boat',
            'boat_title',
            'reviewer',
            'reviewer_username',
            'reviewed_user',
            'reviewed_username',
            'review_type',
            'role',
            'created_at',
        ]


class CreateReviewSerializer(serializers.ModelSerializer):
    review_type = serializers.ChoiceField(
        choices=[Review.REVIEW_TYPE_BOAT, Review.REVIEW_TYPE_USER]
    )
    comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=MAX_REVIEW_COMMENT_LENGTH,
        trim_whitespace=True,
    )

    class Meta:
        model = Review
        fields = ['booking', 'review_type', 'rating', 'comment']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate_comment(self, value):
        return (value or '').strip()

    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        booking = attrs.get('booking')
        review_type = attrs.get('review_type')

        if booking.status != 'confirmed':
            raise serializers.ValidationError({
                'booking': ['Only confirmed bookings can be reviewed.']
            })

        booking_return_datetime = get_booking_return_datetime(booking)
        if timezone.now() < booking_return_datetime:
            raise serializers.ValidationError({
                'booking': ['You can only review after the trip has been completed.']
            })

        if user != booking.renter and user != booking.boat.host:
            raise serializers.ValidationError({
                'booking': ['You can only review bookings you participated in.']
            })

        if review_type == Review.REVIEW_TYPE_BOAT:
            if user != booking.renter:
                raise serializers.ValidationError({
                    'review_type': ['Only the renter can leave a boat review.']
                })

            already_exists = Review.objects.filter(
                booking=booking,
                reviewer=user,
                boat=booking.boat,
                review_type=Review.REVIEW_TYPE_BOAT,
            ).exists()

            if already_exists:
                raise serializers.ValidationError({
                    'booking': ['You have already reviewed this boat for this booking.']
                })

            return attrs

        if user == booking.renter:
            reviewed_user = booking.boat.host
        else:
            reviewed_user = booking.renter

        already_exists = Review.objects.filter(
            booking=booking,
            reviewer=user,
            reviewed_user=reviewed_user,
            review_type=Review.REVIEW_TYPE_USER,
        ).exists()

        if already_exists:
            raise serializers.ValidationError({
                'booking': ['You have already reviewed this user for this booking.']
            })

        return attrs

    def create(self, validated_data):
        request = self.context['request']
        booking = validated_data['booking']
        user = request.user
        review_type = validated_data['review_type']

        if review_type == Review.REVIEW_TYPE_BOAT:
            return Review.objects.create(
                booking=booking,
                boat=booking.boat,
                reviewer=user,
                reviewed_user=None,
                review_type=Review.REVIEW_TYPE_BOAT,
                role=Review.ROLE_BOAT,
                rating=validated_data['rating'],
                comment=validated_data.get('comment', ''),
            )

        if user == booking.renter:
            reviewed_user = booking.boat.host
            role = Review.ROLE_HOST
        else:
            reviewed_user = booking.renter
            role = Review.ROLE_RENTER

        return Review.objects.create(
            booking=booking,
            boat=booking.boat,
            reviewer=user,
            reviewed_user=reviewed_user,
            review_type=Review.REVIEW_TYPE_USER,
            role=role,
            rating=validated_data['rating'],
            comment=validated_data.get('comment', ''),
        )