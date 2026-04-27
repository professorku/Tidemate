from django.conf import settings


def parse_positive_page_size(raw_page_size):
    if raw_page_size in (None, ""):
        return None

    try:
        page_size = int(raw_page_size)
    except (TypeError, ValueError):
        return None

    if page_size <= 0:
        return None

    return page_size


def parse_radius_params(params):
    latitude = params.get("latitude")
    longitude = params.get("longitude")
    radius_km = params.get("radius_km")

    if not (latitude and longitude and radius_km):
        return None

    try:
        center_lat = float(latitude)
        center_lng = float(longitude)
        radius = float(radius_km)
    except (TypeError, ValueError):
        return False

    if not (-90 <= center_lat <= 90 and -180 <= center_lng <= 180):
        return False

    max_radius_km = float(getattr(settings, "LISTING_SEARCH_MAX_RADIUS_KM", 500.0))
    if radius <= 0 or radius > max_radius_km:
        return False

    return {
        "center_lat": center_lat,
        "center_lng": center_lng,
        "radius": radius,
    }
