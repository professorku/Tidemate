import hashlib
import math
import re
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

COUNTRY_NAMES = {
    'norway',
    'norge',
}

PRIVATE_ADDRESS_WORDS = {
    'gate',
    'gata',
    'gaten',
    'vei',
    'veien',
    'veg',
    'vegen',
    'road',
    'street',
    'avenue',
    'dock',
    'pier',
    'slip',
    'marina',
    'brygge',
    'kai',
    'havn',
    'harbor',
    'harbour',
}

POSTCODE_PATTERN = re.compile(r'\b\d{4}\b')
DIGIT_PATTERN = re.compile(r'\d')


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


def _normalize_location_part(value):
    return (value or '').strip().strip(',')


def _part_looks_private(value):
    normalized = _normalize_location_part(value)
    lowered = normalized.lower()

    if not normalized:
        return True

    if lowered in COUNTRY_NAMES:
        return True

    if POSTCODE_PATTERN.search(lowered):
        return True

    if lowered.isdigit():
        return True

    if len(normalized) <= 1:
        return True

    for word in PRIVATE_ADDRESS_WORDS:
        if re.search(rf'\b{re.escape(word)}\b', lowered):
            return True

    return False


def get_public_location_name(value):

    raw_value = (value or '').strip()

    if not raw_value:
        return ''

    parts = [_normalize_location_part(part) for part in raw_value.split(',')]
    parts = [part for part in parts if part]

    if not parts:
        return ''

    if len(parts) >= 5:
        preferred_parts = parts[2:4]
    elif len(parts) == 4:
        preferred_parts = parts[1:3]
    else:
        preferred_parts = parts[:2]

    safe_parts = [
        part for part in preferred_parts
        if not _part_looks_private(part)
    ]

    if not safe_parts:
        safe_parts = [
            part for part in parts
            if not _part_looks_private(part)
        ]

    if not safe_parts:
        return 'Approximate area'

    return ', '.join(safe_parts[:2])


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

    raw_location_name = (getattr(boat, 'location_name', '') or '').strip()
    public_location_name = get_public_location_name(raw_location_name)

    pickup_address = (getattr(boat, 'pickup_address', '') or '').strip()
    pickup_instructions = (getattr(boat, 'pickup_instructions', '') or '').strip()

    if exact_latitude is None or exact_longitude is None:
        return {
            'location_name': public_location_name,
            'latitude': None,
            'longitude': None,
            'approximate_latitude': None,
            'approximate_longitude': None,
            'exact_location_available': False,
            'location_precision': 'unavailable',
            'location_radius_km': None,
            'location_disclosure_message': UNAVAILABLE_LOCATION_MESSAGE,
            'pickup_address': None,
            'pickup_instructions': None,
        }

    approximate_latitude, approximate_longitude = get_approximate_boat_coordinates(boat)
    can_view_exact = user_can_view_exact_boat_location(user, boat)

    if can_view_exact:
        return {
            # Still keep location_name public/safe. Exact text belongs in pickup_address.
            'location_name': public_location_name,
            'latitude': _round_coordinate(exact_latitude),
            'longitude': _round_coordinate(exact_longitude),
            'approximate_latitude': approximate_latitude,
            'approximate_longitude': approximate_longitude,
            'exact_location_available': True,
            'location_precision': 'exact',
            'location_radius_km': 0,
            'location_disclosure_message': EXACT_LOCATION_MESSAGE,
            'pickup_address': pickup_address or raw_location_name or None,
            'pickup_instructions': pickup_instructions or None,
        }

    return {
        'location_name': public_location_name,
        'latitude': approximate_latitude,
        'longitude': approximate_longitude,
        'approximate_latitude': approximate_latitude,
        'approximate_longitude': approximate_longitude,
        'exact_location_available': False,
        'location_precision': 'approximate',
        'location_radius_km': APPROXIMATE_LOCATION_RADIUS_KM,
        'location_disclosure_message': APPROXIMATE_LOCATION_MESSAGE,
        'pickup_address': None,
        'pickup_instructions': None,
    }