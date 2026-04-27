import logging

from django.conf import settings

from .filters import apply_bounding_box_filter
from .geometry import haversine_km
from .parsing import parse_positive_page_size, parse_radius_params
from .postgis import apply_postgis_radius_filter, postgis_is_available

logger = logging.getLogger(__name__)


def apply_python_radius_filter(queryset, center_lat, center_lng, radius_km, page_size=None):
    queryset = apply_bounding_box_filter(queryset, center_lat, center_lng, radius_km)

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
    fallback_cap = min(
        fallback_cap,
        int(getattr(settings, "LISTING_SEARCH_FALLBACK_MAX_CANDIDATES", 250)),
    )

    candidate_queryset = queryset.order_by("-created_at")[:fallback_cap]

    boats_with_distance = []
    for boat in candidate_queryset.iterator():
        distance = haversine_km(
            center_lat,
            center_lng,
            float(boat.latitude),
            float(boat.longitude),
        )

        if distance <= radius_km:
            boat.distance_km = round(distance, 1)
            boats_with_distance.append(boat)

    if queryset.count() > fallback_cap:
        logger.warning(
            "Python geo fallback truncated candidate set from %s to %s rows.",
            queryset.count(),
            fallback_cap,
        )

    boats_with_distance.sort(
        key=lambda boat: (boat.distance_km, -boat.created_at.timestamp(), boat.id)
    )

    return boats_with_distance



def apply_radius_filter(queryset, params):
    parsed_radius = parse_radius_params(params)
    if parsed_radius is None:
        return queryset
    if parsed_radius is False:
        return []

    if postgis_is_available():
        return apply_postgis_radius_filter(
            queryset=queryset,
            center_lat=parsed_radius["center_lat"],
            center_lng=parsed_radius["center_lng"],
            radius_km=parsed_radius["radius"],
            page_size=params.get("page_size"),
        )

    return apply_python_radius_filter(
        queryset=queryset,
        center_lat=parsed_radius["center_lat"],
        center_lng=parsed_radius["center_lng"],
        radius_km=parsed_radius["radius"],
        page_size=params.get("page_size"),
    )
