from .listing_search_parts.basic_filters import apply_basic_filters
from .listing_search_parts.geo_filters import apply_radius_filter


def filter_listings(queryset, params, user=None):
    queryset = apply_basic_filters(queryset, params)

    radius_filtered = apply_radius_filter(
        queryset=queryset,
        params=params,
        user=user,
    )

    if isinstance(radius_filtered, list):
        return radius_filtered

    return radius_filtered