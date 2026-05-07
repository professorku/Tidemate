from django.utils import timezone

from bookings.models import Booking
from notifications.models import Notification

from .models import Review
from .review_helpers import get_booking_return_datetime


def get_user_display_name(user, fallback='User'):
    if not user:
        return fallback

    profile = getattr(user, 'profile', None)
    display_name = getattr(profile, 'display_name', '') if profile else ''

    return (display_name or user.username or fallback).strip()


def create_review_notification(review):
    if review.review_type == Review.REVIEW_TYPE_USER and review.reviewed_user:
        reviewer_name = get_user_display_name(review.reviewer, fallback='Someone')

        Notification.objects.create(
            user=review.reviewed_user,
            message=f"{reviewer_name} left you a review ({review.rating}/5) for {review.boat.title}.",
            target_url=f'/users/{review.reviewed_user.id}',
        )


def get_reviewable_bookings_for_user(user):
    bookings = (
        Booking.objects.filter(status='confirmed', boat__host=user)
        | Booking.objects.filter(status='confirmed', renter=user)
    )
    return (
        bookings.select_related('boat', 'boat__host', 'renter')
        .order_by('-end_date')
        .distinct()
    )


def build_reviewable_booking_payload(booking, user):
    is_renter = user == booking.renter
    is_host = user == booking.boat.host

    if not is_renter and not is_host:
        return None

    target_user = booking.boat.host if is_renter else booking.renter
    target_role = 'host' if is_renter else 'renter'

    already_reviewed_user = Review.objects.filter(
        booking=booking,
        reviewer=user,
        reviewed_user=target_user,
        review_type=Review.REVIEW_TYPE_USER,
    ).exists()

    already_reviewed_boat = Review.objects.filter(
        booking=booking,
        reviewer=user,
        boat=booking.boat,
        review_type=Review.REVIEW_TYPE_BOAT,
    ).exists()

    trip_finished = timezone.now() >= get_booking_return_datetime(booking)
    can_review_user = trip_finished and not already_reviewed_user
    can_review_boat = trip_finished and is_renter and not already_reviewed_boat

    return {
        'booking_id': booking.id,
        'boat_id': booking.boat.id,
        'boat_title': booking.boat.title,
        'boat_image': booking.boat.image.url if booking.boat.image else None,
        'boat_thumbnail': booking.boat.thumbnail.url if booking.boat.thumbnail else (booking.boat.image.url if booking.boat.image else None),
        'target_user_id': target_user.id,
        'target_username': target_user.username,
        'target_display_name': get_user_display_name(target_user),
        'target_role': target_role,
        'start_date': booking.start_date,
        'end_date': booking.end_date,
        'trip_finished': trip_finished,
        'can_review_boat': can_review_boat,
        'boat_reviewed': already_reviewed_boat,
        'can_review_user': can_review_user,
        'user_reviewed': already_reviewed_user,
    }