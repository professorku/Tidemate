from django.db.models import Q

from listings.models import BoatListing

from .geometry import get_bounding_box
from .parsing import parse_basic_search_params


def apply_basic_filters(queryset, params):
    allowed_boat_types = [choice[0] for choice in BoatListing.BOAT_TYPES]
    parsed_params = parse_basic_search_params(params, allowed_boat_types)

    q = parsed_params["q"]
    boat_type = parsed_params["boat_type"]
    min_guests = parsed_params["min_guests"]
    min_price = parsed_params["min_price"]
    max_price = parsed_params["max_price"]
    exclude_id = parsed_params["exclude_id"]
    host_id = parsed_params["host_id"]

    if q:
        queryset = queryset.filter(
            Q(title__icontains=q) | Q(location_name__icontains=q)
        )

    if boat_type:
        queryset = queryset.filter(boat_type=boat_type)

    if min_guests is not None:
        queryset = queryset.filter(guests__gte=min_guests)

    if min_price is not None:
        queryset = queryset.filter(price_per_day__gte=min_price)

    if max_price is not None:
        queryset = queryset.filter(price_per_day__lte=max_price)

    if exclude_id is not None:
        queryset = queryset.exclude(id=exclude_id)

    if host_id is not None:
        queryset = queryset.filter(host_id=host_id)

    return queryset


def apply_bounding_box_filter(queryset, center_lat, center_lng, radius_km):
    bounds = get_bounding_box(center_lat, center_lng, radius_km)

    return queryset.filter(
        latitude__isnull=False,
        longitude__isnull=False,
        latitude__gte=bounds["min_lat"],
        latitude__lte=bounds["max_lat"],
        longitude__gte=bounds["min_lng"],
        longitude__lte=bounds["max_lng"],
    )