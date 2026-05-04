from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.exceptions import ValidationError

from config.booking_policy import MAX_BOOKING_DURATION_DAYS


MAX_LISTING_SEARCH_QUERY_LENGTH = 100


def _clean_raw_value(value):
    """
    Query params arrive as strings. Treat None, empty string, and whitespace-only
    values as missing.
    """
    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()
        if value == "":
            return None

    return value


def parse_positive_page_size(raw_page_size):
    """
    Used only by the Python geo fallback to decide how many candidate rows to scan.
    Invalid page sizes are ignored here because DRF pagination validates the real
    page_size parameter separately.
    """
    raw_page_size = _clean_raw_value(raw_page_size)
    if raw_page_size is None:
        return None

    try:
        page_size = int(raw_page_size)
    except (TypeError, ValueError):
        return None

    if page_size <= 0:
        return None

    return page_size


def parse_positive_int_param(params, key):
    raw_value = _clean_raw_value(params.get(key))
    if raw_value is None:
        return None

    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        raise ValidationError({
            key: "Enter a valid positive integer."
        })

    if value <= 0:
        raise ValidationError({
            key: "Must be greater than 0."
        })

    return value


def parse_non_negative_decimal_param(params, key):
    raw_value = _clean_raw_value(params.get(key))
    if raw_value is None:
        return None

    try:
        value = Decimal(str(raw_value))
    except (InvalidOperation, TypeError, ValueError):
        raise ValidationError({
            key: "Enter a valid number."
        })

    if not value.is_finite():
        raise ValidationError({
            key: "Enter a valid number."
        })

    if value < 0:
        raise ValidationError({
            key: "Must be greater than or equal to 0."
        })

    return value


def parse_choice_param(params, key, allowed_values):
    raw_value = _clean_raw_value(params.get(key))
    if raw_value is None:
        return None

    if raw_value not in allowed_values:
        raise ValidationError({
            key: f"Invalid choice. Allowed values are: {', '.join(allowed_values)}."
        })

    return raw_value


def parse_search_query_param(params):
    q = _clean_raw_value(params.get("q"))

    if q is None:
        return None

    q = str(q).strip()

    if not q:
        return None

    if len(q) > MAX_LISTING_SEARCH_QUERY_LENGTH:
        raise ValidationError({
            "q": f"Search query cannot exceed {MAX_LISTING_SEARCH_QUERY_LENGTH} characters."
        })

    return q


def parse_date_param(params, key):
    raw_value = _clean_raw_value(params.get(key))
    if raw_value is None:
        return None

    value = parse_date(str(raw_value))

    if value is None:
        raise ValidationError({
            key: "Enter a valid date in YYYY-MM-DD format."
        })

    return value


def parse_availability_date_range_params(params):
    """
    Parse listing availability search dates.

    Dates use the same half-open range as bookings:

        [start_date, end_date)

    This means a booking ending on June 10 does not block a new search that starts
    on June 10.
    """
    start_date = parse_date_param(params, "start_date")
    end_date = parse_date_param(params, "end_date")

    if start_date is None and end_date is None:
        return {
            "start_date": None,
            "end_date": None,
        }

    if start_date is None:
        raise ValidationError({
            "start_date": "This parameter is required when using end_date."
        })

    if end_date is None:
        raise ValidationError({
            "end_date": "This parameter is required when using start_date."
        })

    if end_date <= start_date:
        raise ValidationError({
            "end_date": "Return date must be after the pickup date."
        })

    if start_date < timezone.localdate():
        raise ValidationError({
            "start_date": "Pickup date cannot be in the past."
        })

    duration_days = (end_date - start_date).days

    if duration_days > MAX_BOOKING_DURATION_DAYS:
        raise ValidationError({
            "end_date": f"Bookings cannot be longer than {MAX_BOOKING_DURATION_DAYS} days."
        })

    return {
        "start_date": start_date,
        "end_date": end_date,
    }


def parse_basic_search_params(params, allowed_boat_types):
    min_guests = parse_positive_int_param(params, "min_guests")
    min_price = parse_non_negative_decimal_param(params, "min_price")
    max_price = parse_non_negative_decimal_param(params, "max_price")
    exclude_id = parse_positive_int_param(params, "exclude_id")
    host_id = parse_positive_int_param(params, "host_id")
    boat_type = parse_choice_param(params, "boat_type", allowed_boat_types)
    availability_dates = parse_availability_date_range_params(params)

    if min_price is not None and max_price is not None and max_price < min_price:
        raise ValidationError({
            "max_price": "Must be greater than or equal to min_price."
        })

    q = parse_search_query_param(params)

    return {
        "q": q,
        "boat_type": boat_type,
        "min_guests": min_guests,
        "min_price": min_price,
        "max_price": max_price,
        "exclude_id": exclude_id,
        "host_id": host_id,
        "start_date": availability_dates["start_date"],
        "end_date": availability_dates["end_date"],
    }


def parse_float_param(params, key):
    raw_value = _clean_raw_value(params.get(key))
    if raw_value is None:
        return None

    try:
        value = float(raw_value)
    except (TypeError, ValueError):
        raise ValidationError({
            key: "Enter a valid number."
        })

    if value != value or value in (float("inf"), float("-inf")):
        raise ValidationError({
            key: "Enter a valid number."
        })

    return value


def parse_radius_params(params):
    latitude = parse_float_param(params, "latitude")
    longitude = parse_float_param(params, "longitude")
    radius_km = parse_float_param(params, "radius_km")

    geo_values = {
        "latitude": latitude,
        "longitude": longitude,
        "radius_km": radius_km,
    }

    provided_values = {
        key: value for key, value in geo_values.items()
        if value is not None
    }

    if not provided_values:
        return None

    if len(provided_values) != 3:
        missing_keys = [
            key for key, value in geo_values.items()
            if value is None
        ]
        raise ValidationError({
            key: "This parameter is required when using radius search."
            for key in missing_keys
        })

    if not -90 <= latitude <= 90:
        raise ValidationError({
            "latitude": "Must be between -90 and 90."
        })

    if not -180 <= longitude <= 180:
        raise ValidationError({
            "longitude": "Must be between -180 and 180."
        })

    max_radius_km = float(getattr(settings, "LISTING_SEARCH_MAX_RADIUS_KM", 500.0))

    if radius_km <= 0 or radius_km > max_radius_km:
        raise ValidationError({
            "radius_km": f"Must be greater than 0 and at most {max_radius_km:g}."
        })

    return {
        "center_lat": latitude,
        "center_lng": longitude,
        "radius": radius_km,
    }