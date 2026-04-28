# backend/listings/selectors.py
from django.db.models import Prefetch

from bookings.expiry import active_booking_filter
from bookings.models import Booking

from .models import BoatListing
from .queryset_utils import annotate_favorite_fields


def listing_base_queryset():
    return (
        BoatListing.objects
        .select_related("host", "host__profile")
        .prefetch_related(
            "images",
            Prefetch(
                "bookings",
                queryset=Booking.objects.filter(active_booking_filter()).order_by("start_date"),
                to_attr="prefetched_active_bookings",
            ),
        )
    )


def get_public_listings_queryset(user):
    queryset = listing_base_queryset().all().order_by("-created_at", "-id")
    return annotate_favorite_fields(queryset, user)


def get_boat_detail_queryset(user):
    queryset = listing_base_queryset().all().order_by("-created_at", "-id")
    return annotate_favorite_fields(queryset, user)


def get_my_boats_queryset(user):
    queryset = listing_base_queryset().filter(host=user).order_by("-created_at", "-id")
    return annotate_favorite_fields(queryset, user)