from math import atan2, cos, degrees, radians, sin, sqrt


def haversine_km(lat1, lng1, lat2, lng2):
    earth_radius_km = 6371.0

    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    )
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return earth_radius_km * c


def get_bounding_box(center_lat, center_lng, radius_km):
    lat_delta = degrees(radius_km / 6371.0)

    cos_lat = cos(radians(center_lat))
    if abs(cos_lat) < 1e-9:
        lng_delta = 180.0
    else:
        lng_delta = degrees(radius_km / (6371.0 * cos_lat))

    return {
        "min_lat": center_lat - lat_delta,
        "max_lat": center_lat + lat_delta,
        "min_lng": center_lng - lng_delta,
        "max_lng": center_lng + lng_delta,
    }
