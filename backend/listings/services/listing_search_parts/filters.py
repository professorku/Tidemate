from django.db.models import Q

from .geometry import get_bounding_box


def apply_basic_filters(queryset, params):
    q = params.get("q")
    boat_type = params.get("boat_type")
    min_guests = params.get("min_guests")
    min_price = params.get("min_price")
    max_price = params.get("max_price")
    exclude_id = params.get("exclude_id")

    if q:
        queryset = queryset.filter(
            Q(title__icontains=q) | Q(location_name__icontains=q)
        )

    if boat_type:
        queryset = queryset.filter(boat_type=boat_type)

    if min_guests:
        queryset = queryset.filter(guests__gte=min_guests)

    if min_price:
        queryset = queryset.filter(price_per_day__gte=min_price)

    if max_price:
        queryset = queryset.filter(price_per_day__lte=max_price)

    if exclude_id:
        queryset = queryset.exclude(id=exclude_id)

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

