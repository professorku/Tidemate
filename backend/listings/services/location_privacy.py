import hashlib
import math
from decimal import Decimal, InvalidOperation

from bookings.models import Booking


APPROXIMATE_LOCATION_RADIUS_KM = 5
APPROXIMATE_LOCATION_MIN_OFFSET_KM = 1.5
APPROXIMATE_LOCATION_MAX_OFFSET_KM = 3.5
EARTH_RADIUS_KM = 6371.0088

EXACT_LOCATION_MESSAGE = 'Exact pickup location is available for this booking.'
APPROXIMATE_LOCATION_MESSAGE = (
    'Exact pickup location is shared after the booking is confirmed. '
    'Until then, this map only shows an approximate area.'
)
UNAVAILABLE_LOCATION_MESSAGE = 'This boat does not have saved map coordinates yet.'


def _as_float(value):
    if value is None:
        return None

    try:
        decimal_value = Decimal(value)
    except (InvalidOperation, TypeError, ValueError):
        return None

    return float(decimal_value)


def _round_coordinate(value):
    if value is None:
        return None

    return round(float(value), 6)


def _round_public_coordinate(value):
    if value is None:
        return None

    return round(float(value), 4)


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


def get_approximate_boat_coordinates(boat):
    latitude = _as_float(getattr(boat, 'latitude', None))
    longitude = _as_float(getattr(boat, 'longitude', None))

    if latitude is None or longitude is None:
        return None, None

    seed = f'tidemate-location-v1:{boat.pk}:{latitude:.6f}:{longitude:.6f}'.encode('utf-8')
    digest = hashlib.sha256(seed).digest()

    bearing = int.from_bytes(digest[:2], 'big') / 65535 * 360
    offset_ratio = int.from_bytes(digest[2:4], 'big') / 65535
    offset_distance = (
        APPROXIMATE_LOCATION_MIN_OFFSET_KM
        + offset_ratio * (APPROXIMATE_LOCATION_MAX_OFFSET_KM - APPROXIMATE_LOCATION_MIN_OFFSET_KM)
    )

    approximate_latitude, approximate_longitude = _destination_point(
        latitude=latitude,
        longitude=longitude,
        distance_km=offset_distance,
        bearing_degrees=bearing,
    )

    return _round_public_coordinate(approximate_latitude), _round_public_coordinate(approximate_longitude)


def user_can_view_exact_boat_location(user, boat):
    if not user or not getattr(user, 'is_authenticated', False):
        return False

    if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
        return True

    if getattr(boat, 'host_id', None) == user.id:
        return True

    if not getattr(boat, 'pk', None):
        return False

    return Booking.objects.filter(
        boat=boat,
        renter=user,
        status='confirmed',
    ).exists()


def build_location_privacy_payload(boat, user):
    exact_latitude = _as_float(getattr(boat, 'latitude', None))
    exact_longitude = _as_float(getattr(boat, 'longitude', None))

    if exact_latitude is None or exact_longitude is None:
        return {
            'latitude': None,
            'longitude': None,
            'approximate_latitude': None,
            'approximate_longitude': None,
            'exact_location_available': False,
            'location_precision': 'unavailable',
            'location_radius_km': None,
            'location_disclosure_message': UNAVAILABLE_LOCATION_MESSAGE,
        }

    approximate_latitude, approximate_longitude = get_approximate_boat_coordinates(boat)
    can_view_exact = user_can_view_exact_boat_location(user, boat)

    if can_view_exact:
        return {
            'latitude': _round_coordinate(exact_latitude),
            'longitude': _round_coordinate(exact_longitude),
            'approximate_latitude': approximate_latitude,
            'approximate_longitude': approximate_longitude,
            'exact_location_available': True,
            'location_precision': 'exact',
            'location_radius_km': 0,
            'location_disclosure_message': EXACT_LOCATION_MESSAGE,
        }

    return {
        'latitude': approximate_latitude,
        'longitude': approximate_longitude,
        'approximate_latitude': approximate_latitude,
        'approximate_longitude': approximate_longitude,
        'exact_location_available': False,
        'location_precision': 'approximate',
        'location_radius_km': APPROXIMATE_LOCATION_RADIUS_KM,
        'location_disclosure_message': APPROXIMATE_LOCATION_MESSAGE,
    }