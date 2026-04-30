import hashlib
import math
from decimal import Decimal, InvalidOperation


APPROXIMATE_LOCATION_MIN_OFFSET_KM = 1.5
APPROXIMATE_LOCATION_MAX_OFFSET_KM = 3.5
EARTH_RADIUS_KM = 6371.0088
PUBLIC_COORDINATE_QUANTUM = Decimal('0.000001')


def _as_float(value):
    if value is None:
        return None

    try:
        decimal_value = Decimal(value)
    except (InvalidOperation, TypeError, ValueError):
        return None

    return float(decimal_value)


def _round_public_coordinate(value):
    if value is None:
        return None

    return round(float(value), 4)


def _round_public_coordinate_decimal(value):
    rounded_value = _round_public_coordinate(value)

    if rounded_value is None:
        return None

    return Decimal(str(rounded_value)).quantize(PUBLIC_COORDINATE_QUANTUM)


def _destination_point(latitude, longitude, distance_km, bearing_degrees):
    lat1 = math.radians(latitude)
    lon1 = math.radians(longitude)
    bearing = math.radians(bearing_degrees)
    angular_distance = distance_km / EARTH_RADIUS_KM

    lat2 = math.asin(
        math.sin(lat1) * math.cos(angular_distance)
        + math.cos(lat1) * math.sin(angular_distance) * math.cos(bearing)
    )

    lon2 = lon1 + math.atan2(
        math.sin(bearing) * math.sin(angular_distance) * math.cos(lat1),
        math.cos(angular_distance) - math.sin(lat1) * math.sin(lat2),
    )

    normalized_lon = (math.degrees(lon2) + 540) % 360 - 180
    return math.degrees(lat2), normalized_lon


def get_public_coordinate_values(listing_id, latitude, longitude):
    latitude = _as_float(latitude)
    longitude = _as_float(longitude)

    if listing_id is None or latitude is None or longitude is None:
        return None, None

    seed = f'tidemate-location-v1:{listing_id}:{latitude:.6f}:{longitude:.6f}'.encode('utf-8')
    digest = hashlib.sha256(seed).digest()

    bearing = int.from_bytes(digest[:2], 'big') / 65535 * 360
    offset_ratio = int.from_bytes(digest[2:4], 'big') / 65535
    offset_distance = (
        APPROXIMATE_LOCATION_MIN_OFFSET_KM
        + offset_ratio * (APPROXIMATE_LOCATION_MAX_OFFSET_KM - APPROXIMATE_LOCATION_MIN_OFFSET_KM)
    )

    public_latitude, public_longitude = _destination_point(
        latitude=latitude,
        longitude=longitude,
        distance_km=offset_distance,
        bearing_degrees=bearing,
    )

    return (
        _round_public_coordinate(public_latitude),
        _round_public_coordinate(public_longitude),
    )


def get_public_coordinate_decimals(listing_id, latitude, longitude):
    public_latitude, public_longitude = get_public_coordinate_values(
        listing_id=listing_id,
        latitude=latitude,
        longitude=longitude,
    )

    return (
        _round_public_coordinate_decimal(public_latitude),
        _round_public_coordinate_decimal(public_longitude),
    )


def get_approximate_boat_coordinates(boat):
    stored_public_latitude = _as_float(getattr(boat, 'public_latitude', None))
    stored_public_longitude = _as_float(getattr(boat, 'public_longitude', None))

    if stored_public_latitude is not None and stored_public_longitude is not None:
        return (
            _round_public_coordinate(stored_public_latitude),
            _round_public_coordinate(stored_public_longitude),
        )

    return get_public_coordinate_values(
        listing_id=getattr(boat, 'pk', None),
        latitude=getattr(boat, 'latitude', None),
        longitude=getattr(boat, 'longitude', None),
    )