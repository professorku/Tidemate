from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from config.booking_policy import build_booking_policy, build_cancellation_policy
from listings.services.location_privacy import build_location_privacy_payload
from reviews.models import Review

from .lifecycle import (
    booking_pickup_datetime,
    booking_return_datetime,
    can_cancel_booking,
    get_booking_lifecycle_stage,
)


class BookingContextMixin:
    def _build_media_url(self, file_field):
        if not file_field:
            return None

        request = self.context.get('request')
        url = file_field.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def _get_request_user(self):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        return user if user and user.is_authenticated else None


class BookingReviewMixin(BookingContextMixin):
    def _get_review_target(self, booking, user):
        if not user:
            return None, None

        if user == booking.renter:
            return booking.boat.host, 'host'

        if user == booking.boat.host:
            return booking.renter, 'renter'

        return None, None

    def _get_existing_review(self, booking, user, review_type):
        if not user:
            return None

        prefetched_reviews = getattr(booking, 'prefetched_reviews', None)
        if prefetched_reviews is not None:
            if review_type == Review.REVIEW_TYPE_BOAT:
                for review in prefetched_reviews:
                    if (
                        review.reviewer_id == user.id
                        and review.review_type == Review.REVIEW_TYPE_BOAT
                        and review.boat_id == booking.boat_id
                    ):
                        return review
                return None

            target_user, _ = self._get_review_target(booking, user)
            if not target_user:
                return None

            for review in prefetched_reviews:
                if (
                    review.reviewer_id == user.id
                    and review.review_type == Review.REVIEW_TYPE_USER
                    and review.reviewed_user_id == target_user.id
                ):
                    return review
            return None

        if review_type == Review.REVIEW_TYPE_BOAT:
            return (
                Review.objects.filter(
                    booking=booking,
                    reviewer=user,
                    boat=booking.boat,
                    review_type=Review.REVIEW_TYPE_BOAT,
                )
                .order_by('-created_at')
                .first()
            )

        target_user, _ = self._get_review_target(booking, user)
        if not target_user:
            return None

        return (
            Review.objects.filter(
                booking=booking,
                reviewer=user,
                reviewed_user=target_user,
                review_type=Review.REVIEW_TYPE_USER,
            )
            .order_by('-created_at')
            .first()
        )

    def _serialize_review_preview(self, review):
        if not review:
            return None

        comment = (review.comment or '').strip()
        comment_preview = comment[:120]
        if len(comment) > 120:
            comment_preview = f'{comment_preview}…'

        return {
            'id': review.id,
            'rating': review.rating,
            'comment_preview': comment_preview,
            'created_at': review.created_at,
        }

    def get_review_target_name(self, obj):
        user = self._get_request_user()
        target_user, _ = self._get_review_target(obj, user)
        return target_user.username if target_user else None

    def get_review_target_role(self, obj):
        user = self._get_request_user()
        _, target_role = self._get_review_target(obj, user)
        return target_role

    def get_can_review_boat(self, obj):
        user = self._get_request_user()
        if not user or user != obj.renter:
            return False
        if obj.status != 'confirmed' or not self.get_trip_finished(obj):
            return False
        return self._get_existing_review(obj, user, Review.REVIEW_TYPE_BOAT) is None

    def get_can_review_user(self, obj):
        user = self._get_request_user()
        if not user or (user != obj.renter and user != obj.boat.host):
            return False
        if obj.status != 'confirmed' or not self.get_trip_finished(obj):
            return False
        return self._get_existing_review(obj, user, Review.REVIEW_TYPE_USER) is None

    def get_viewer_boat_review(self, obj):
        user = self._get_request_user()
        return self._serialize_review_preview(
            self._get_existing_review(obj, user, Review.REVIEW_TYPE_BOAT)
        )

    def get_viewer_user_review(self, obj):
        user = self._get_request_user()
        return self._serialize_review_preview(
            self._get_existing_review(obj, user, Review.REVIEW_TYPE_USER)
        )


class BookingRepresentationMixin(BookingReviewMixin):
    def _get_location_payload(self, obj):
        cache_key = '_tidemate_booking_location_privacy_payload'
        cached_payload = getattr(obj, cache_key, None)

        if cached_payload is not None:
            return cached_payload

        payload = build_location_privacy_payload(
            obj.boat,
            self._get_request_user(),
            booking=obj,
        )
        setattr(obj, cache_key, payload)
        return payload

    def get_boat_image(self, obj):
        if obj.boat and obj.boat.image:
            return self._build_media_url(obj.boat.image)
        return None

    def get_renter_avatar(self, obj):
        profile = getattr(obj.renter, 'profile', None)
        if profile and profile.avatar:
            return self._build_media_url(profile.avatar)
        return None

    def get_latitude(self, obj):
        return self._get_location_payload(obj)['latitude']

    def get_longitude(self, obj):
        return self._get_location_payload(obj)['longitude']

    def get_approximate_latitude(self, obj):
        return self._get_location_payload(obj)['approximate_latitude']

    def get_approximate_longitude(self, obj):
        return self._get_location_payload(obj)['approximate_longitude']

    def get_exact_location_available(self, obj):
        return self._get_location_payload(obj)['exact_location_available']

    def get_location_precision(self, obj):
        return self._get_location_payload(obj)['location_precision']

    def get_location_radius_km(self, obj):
        return self._get_location_payload(obj)['location_radius_km']

    def get_location_disclosure_message(self, obj):
        return self._get_location_payload(obj)['location_disclosure_message']

    def get_pickup_address(self, obj):
        return self._get_location_payload(obj)['pickup_address']

    def get_pickup_instructions(self, obj):
        return self._get_location_payload(obj)['pickup_instructions']

    def get_pickup_datetime(self, obj):
        return booking_pickup_datetime(obj)

    def get_return_datetime(self, obj):
        return booking_return_datetime(obj)

    def get_duration_days(self, obj):
        return (obj.end_date - obj.start_date).days

    def get_rental_policy(self, obj):
        return build_booking_policy()

    def get_cancellation_policy(self, obj):
        return build_cancellation_policy()

    def get_lifecycle_stage(self, obj):
        return get_booking_lifecycle_stage(obj)

    def get_trip_finished(self, obj):
        return timezone.now() >= booking_return_datetime(obj)

    def get_conversation_id(self, obj):
        try:
            return obj.conversation.id
        except ObjectDoesNotExist:
            return None

    def get_can_confirm(self, obj):
        user = self._get_request_user()
        return bool(user and obj.boat.host == user and obj.status == 'pending')

    def get_can_cancel(self, obj):
        user = self._get_request_user()
        return bool(user and (obj.renter == user or obj.boat.host == user) and can_cancel_booking(obj))