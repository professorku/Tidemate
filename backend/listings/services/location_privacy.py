import re
from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.utils import timezone

from bookings.lifecycle import booking_pickup_datetime, booking_return_datetime
from bookings.models import Booking
from listings.services.public_coordinates import get_approximate_boat_coordinates


APPROXIMATE_LOCATION_RADIUS_KM = 20
EXACT_LOCATION_DISCLOSURE_WINDOW_HOURS = 24

EXACT_LOCATION_MESSAGE = 'Exact pickup location is available for this booking.'
APPROXIMATE_LOCATION_MESSAGE = (
    'Exact pickup location is only shared with confirmed renters from '
    f'{EXACT_LOCATION_DISCLOSURE_WINDOW_HOURS} hours before pickup until return. '
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

COORDINATE_PAIR_PATTERN = re.compile(
    r'\b-?\d{1,2}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\b'
)

STREET_WORD_PATTERN = (
    r'gate|gata|gaten|vei|veien|veg|vegen|road|street|avenue|aveny|'
    r'lane|drive|boulevard|blvd|place|plass|allé|alle'
)

STREET_ADDRESS_PATTERN = re.compile(
    rf"\b[\wÀ-ÖØ-öø-ÿ .’'-]{{1,80}}(?:{STREET_WORD_PATTERN})\s+\d+[a-z]?\b|"
    rf"\b\d+[a-z]?\s+[\wÀ-ÖØ-öø-ÿ .’'-]{{1,80}}(?:{STREET_WORD_PATTERN})\b",
    re.IGNORECASE,
)

PRIVATE_DOCK_WORD_PATTERN = (
    r'dock|pier|slip|berth|mooring|pontoon|jetty|båtplass|baatplass|'
    r'brygge|kai|marina|havn|harbor|harbour'
)

PRIVATE_DOCK_WITH_IDENTIFIER_PATTERN = re.compile(
    rf'\b(?:{PRIVATE_DOCK_WORD_PATTERN})\b\s*(?:nr\.?|no\.?|number|#)?\s*[a-z]?[- ]?\d+[a-z]?\b|'
    rf'\b(?:{PRIVATE_DOCK_WORD_PATTERN})\b\s+[a-z]\d+\b',
    re.IGNORECASE,
)

PICKUP_DETAIL_PATTERN = re.compile(
    rf'\b(?:pickup|pick-up|pick up|meet|meeting point|hent|henting|møt|mote|møteplass|oppmøte|address|adresse)\b'
    rf'.{{0,60}}\b(?:{STREET_WORD_PATTERN}|{PRIVATE_DOCK_WORD_PATTERN}|address|adresse)\b',
    re.IGNORECASE,
)

PUBLIC_LOCATION_TEXT_PRIVACY_ERROR = (
    'Do not put exact pickup details in public listing text. '
    'Use the private pickup address/instructions fields for street addresses, dock numbers, '
    'marina slips, coordinates, or meeting-point details.'
)


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


def get_public_location_text_privacy_error(value):
    text = (value or '').strip()

    if not text:
        return None

    lowered = text.lower()

    if COORDINATE_PAIR_PATTERN.search(text):
        return PUBLIC_LOCATION_TEXT_PRIVACY_ERROR

    if POSTCODE_PATTERN.search(lowered):
        return PUBLIC_LOCATION_TEXT_PRIVACY_ERROR

    if STREET_ADDRESS_PATTERN.search(text):
        return PUBLIC_LOCATION_TEXT_PRIVACY_ERROR

    if PRIVATE_DOCK_WITH_IDENTIFIER_PATTERN.search(text):
        return PUBLIC_LOCATION_TEXT_PRIVACY_ERROR

    if PICKUP_DETAIL_PATTERN.search(text):
        return PUBLIC_LOCATION_TEXT_PRIVACY_ERROR

    return None


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


def _booking_exact_location_window(booking):
    pickup_datetime = booking_pickup_datetime(booking)
    return_datetime = booking_return_datetime(booking)
    disclosure_start = pickup_datetime - timedelta(
        hours=EXACT_LOCATION_DISCLOSURE_WINDOW_HOURS,
    )

    return disclosure_start, return_datetime


def confirmed_booking_is_in_exact_location_window(booking, *, now=None):
    if getattr(booking, 'status', None) != 'confirmed':
        return False

    current_time = now or timezone.now()
    disclosure_start, disclosure_end = _booking_exact_location_window(booking)

    return disclosure_start <= current_time <= disclosure_end


def user_can_view_exact_boat_location(user, boat, *, booking=None, now=None):
    if not user or not getattr(user, 'is_authenticated', False):
        return False

    if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
        return True

    if getattr(boat, 'host_id', None) == user.id:
        return True

    if not getattr(boat, 'pk', None):
        return False

    if booking is not None:
        return bool(
            getattr(booking, 'boat_id', None) == boat.id
            and getattr(booking, 'renter_id', None) == user.id
            and confirmed_booking_is_in_exact_location_window(booking, now=now)
        )

    confirmed_bookings = Booking.objects.filter(
        boat=boat,
        renter=user,
        status='confirmed',
    ).only('id', 'status', 'start_date', 'end_date')

    return any(
        confirmed_booking_is_in_exact_location_window(booking, now=now)
        for booking in confirmed_bookings
    )


def build_location_privacy_payload(boat, user, *, booking=None, now=None):
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
    can_view_exact = user_can_view_exact_boat_location(
        user,
        boat,
        booking=booking,
        now=now,
    )

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