import logging

from django.conf import settings

from listings.services.public_coordinates import get_approximate_boat_coordinates

from .filters import apply_bounding_box_filter
from .geometry import get_bounding_box, haversine_km
from .parsing import parse_positive_page_size, parse_radius_params
from .postgis import apply_postgis_radius_filter, postgis_is_available

logger = logging.getLogger(__name__)


def _get_fallback_candidate_cap(page_size=None):
 
    fallback_cap = max(
        parse_positive_page_size(page_size) or settings.LISTING_SEARCH_MAX_LIMIT,
        int(
            getattr(
                settings,
                "LISTING_SEARCH_FALLBACK_MIN_CANDIDATES",
                settings.LISTING_SEARCH_MAX_LIMIT,
            )
        ),
    )

    return min(
        fallback_cap,
        int(getattr(settings, "LISTING_SEARCH_FALLBACK_MAX_CANDIDATES", 250)),
    )


def _user_can_search_exact_coordinates(user):
  
    if not user or not getattr(user, "is_authenticated", False):
        return False

    return bool(getattr(user, "is_staff", False) or getattr(user, "is_superuser", False))


def _exact_boat_coordinates(boat):
    if boat.latitude is None or boat.longitude is None:
        return None, None

    return float(boat.latitude), float(boat.longitude)


def _public_boat_search_coordinates(boat):
    if boat.public_latitude is not None and boat.public_longitude is not None:
        return float(boat.public_latitude), float(boat.public_longitude)

    return get_approximate_boat_coordinates(boat)


def _sort_radius_results(boats_with_distance):
    boats_with_distance.sort(
        key=lambda boat: (boat.distance_km, -boat.created_at.timestamp(), boat.id)
    )
    return boats_with_distance


def apply_python_radius_filter(queryset, center_lat, center_lng, radius_km, page_size=None):
    queryset = apply_bounding_box_filter(queryset, center_lat, center_lng, radius_km)
    fallback_cap = _get_fallback_candidate_cap(page_size)
    candidate_queryset = queryset.order_by("-created_at", "-id")[:fallback_cap]

    boats_with_distance = []

    for boat in candidate_queryset.iterator(chunk_size=500):
        boat_lat, boat_lng = _exact_boat_coordinates(boat)
        if boat_lat is None or boat_lng is None:
            continue

        distance = haversine_km(center_lat, center_lng, boat_lat, boat_lng)

        if distance <= radius_km:
            boat.distance_km = round(distance, 1)
            boats_with_distance.append(boat)

    queryset_count = queryset.count()
    if queryset_count > fallback_cap:
        logger.warning(
            "Exact-coordinate radius search fallback scanned only %s of %s candidate listings.",
            fallback_cap,
            queryset_count,
        )

    return _sort_radius_results(boats_with_distance)


def apply_privacy_safe_radius_filter(queryset, center_lat, center_lng, radius_km, page_size=None):

    bounds = get_bounding_box(center_lat, center_lng, radius_km)

    queryset = queryset.filter(
        public_latitude__isnull=False,
        public_longitude__isnull=False,
        public_latitude__gte=bounds["min_lat"],
        public_latitude__lte=bounds["max_lat"],
        public_longitude__gte=bounds["min_lng"],
        public_longitude__lte=bounds["max_lng"],
    )

    boats_with_distance = []

    for boat in queryset.iterator(chunk_size=500):
        public_lat, public_lng = _public_boat_search_coordinates(boat)
        if public_lat is None or public_lng is None:
            continue

        distance = haversine_km(center_lat, center_lng, public_lat, public_lng)

        if distance <= radius_km:
            boat.distance_km = round(distance, 1)
            boats_with_distance.append(boat)

    return _sort_radius_results(boats_with_distance)


def apply_radius_filter(queryset, params, user=None):
    parsed_radius = parse_radius_params(params)

    if parsed_radius is None:
        return queryset

    center_lat = parsed_radius["center_lat"]
    center_lng = parsed_radius["center_lng"]
    radius_km = parsed_radius["radius"]
    page_size = params.get("page_size")

    if _user_can_search_exact_coordinates(user):
        if postgis_is_available():
            return apply_postgis_radius_filter(
                queryset=queryset,
                center_lat=center_lat,
                center_lng=center_lng,
                radius_km=radius_km,
                page_size=page_size,
            )

        return apply_python_radius_filter(
            queryset=queryset,
            center_lat=center_lat,
            center_lng=center_lng,
            radius_km=radius_km,
            page_size=page_size,
        )

    return apply_privacy_safe_radius_filter(
        queryset=queryset,
        center_lat=center_lat,
        center_lng=center_lng,
        radius_km=radius_km,
        page_size=page_size,
    )