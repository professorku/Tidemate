from datetime import timedelta

from django.db.models import Case, CharField, DateTimeField, Prefetch, Q, Value, When
from django.db.models.functions import Cast, Now

from config.booking_policy import BOOKING_END_TIME, BOOKING_START_TIME
from reviews.models import Review

from .expiry import active_pending_booking_filter
from .models import Booking


def booking_base_queryset():
    return Booking.objects.select_related(
        'boat',
        'boat__host',
        'renter',
        'renter__profile',
        'conversation',
    ).prefetch_related(
        Prefetch(
            'reviews',
            queryset=Review.objects.select_related(
                'reviewer',
                'reviewed_user',
                'boat',
            ).order_by('-created_at', '-id'),
            to_attr='prefetched_reviews',
        )
    )


def apply_timeline_filter(queryset, timeline):
    if timeline not in {'upcoming', 'active', 'pending', 'completed', 'cancelled'}:
        return queryset

    pickup_offset = timedelta(
        hours=BOOKING_START_TIME.hour,
        minutes=BOOKING_START_TIME.minute,
        seconds=BOOKING_START_TIME.second,
    )
    return_offset = timedelta(
        hours=BOOKING_END_TIME.hour,
        minutes=BOOKING_END_TIME.minute,
        seconds=BOOKING_END_TIME.second,
    )

    annotated = queryset.annotate(
        pickup_at=Cast('start_date', output_field=DateTimeField()) + Value(pickup_offset),
        return_at=Cast('end_date', output_field=DateTimeField()) + Value(return_offset),
    ).annotate(
        lifecycle_stage=Case(
            When(status='cancelled', then=Value('cancelled')),
            When(status='pending', expires_at__lte=Now(), then=Value('cancelled')),
            When(status='pending', then=Value('pending')),
            When(status='confirmed', pickup_at__gt=Now(), then=Value('upcoming')),
            When(status='confirmed', pickup_at__lte=Now(), return_at__gte=Now(), then=Value('active')),
            default=Value('completed'),
            output_field=CharField(),
        )
    )

    return annotated.filter(lifecycle_stage=timeline)


def get_user_bookings(user):
    return (
        booking_base_queryset()
        .filter(
            renter=user,
            archived_by_renter_at__isnull=True,
        )
        .order_by('-created_at', '-id')
    )


def get_host_bookings(user, *, status_value=None):
    queryset = (
        booking_base_queryset()
        .filter(
            boat__host=user,
            archived_by_host_at__isnull=True,
        )
        .order_by('-created_at', '-id')
    )

    if status_value in ['pending', 'confirmed', 'cancelled']:
        queryset = queryset.filter(status=status_value)

    return queryset

def get_booking_lookup_filter(booking_lookup):
    booking_lookup = str(booking_lookup or '').strip()

    lookup_filter = Q(public_id__iexact=booking_lookup)

    if booking_lookup.isdigit():
        lookup_filter |= Q(id=int(booking_lookup))

    return lookup_filter


def get_visible_booking_for_user(user, booking_id):
    return booking_base_queryset().filter(
        get_booking_lookup_filter(booking_id),
        Q(renter=user, archived_by_renter_at__isnull=True)
        | Q(boat__host=user, archived_by_host_at__isnull=True),
    ).first()


def get_host_booking_for_user(user, booking_id):
    return booking_base_queryset().filter(
        get_booking_lookup_filter(booking_id),
        boat__host=user,
        archived_by_host_at__isnull=True,
    ).first()


def get_overlapping_pending_bookings(booking):
    return Booking.objects.select_related(
        'boat',
        'boat__host',
        'renter',
        'renter__profile',
    ).filter(
        active_pending_booking_filter(),
        boat=booking.boat,
        start_date__lt=booking.end_date,
        end_date__gt=booking.start_date,
    ).exclude(id=booking.id)