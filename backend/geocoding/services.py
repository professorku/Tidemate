import hashlib
import json
import logging
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

COORDINATE_DECIMALS = 6
SEARCH_CACHE_PREFIX = "geocoding:search:v1"
REVERSE_CACHE_PREFIX = "geocoding:reverse:v1"
DEFAULT_GEOCODING_PROVIDER_HOST = "nominatim.openstreetmap.org"


class GeocodingError(Exception):
    """Raised when the upstream geocoding provider cannot be used safely."""


def parse_coordinate(value):
    if value in (None, ""):
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    return number if number == number else None


def round_coordinate(value):
    number = parse_coordinate(value)
    if number is None:
        return None

    return round(number, COORDINATE_DECIMALS)


def format_coordinate(value):
    number = round_coordinate(value)
    if number is None:
        return ""

    return f"{number:.{COORDINATE_DECIMALS}f}"


def validate_latitude(value):
    latitude = round_coordinate(value)
    if latitude is None or latitude < -90 or latitude > 90:
        return None
    return latitude


def validate_longitude(value):
    longitude = round_coordinate(value)
    if longitude is None or longitude < -180 or longitude > 180:
        return None
    return longitude


def _first_non_empty(*values):
    for value in values:
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _get_city_or_county(address=None, display_name=""):
    address = address or {}
    public_name = _first_non_empty(
        address.get("city"),
        address.get("town"),
        address.get("village"),
        address.get("municipality"),
        address.get("county"),
        address.get("state_district"),
        address.get("state"),
        address.get("region"),
        address.get("country"),
    )

    if public_name:
        return public_name

    return display_name.split(",")[0].strip() if display_name else ""


def _get_exact_address(address=None, display_name="", latitude=None, longitude=None):
    address = address or {}

    street_parts = [address.get("road"), address.get("house_number")]
    street = " ".join(
        part.strip()
        for part in street_parts
        if isinstance(part, str) and part.strip()
    )

    local_parts = [
        address.get("neighbourhood"),
        address.get("suburb"),
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality"),
        address.get("county"),
    ]

    exact_parts = []

    if street:
        exact_parts.append(street)

    for part in local_parts:
        if isinstance(part, str) and part.strip() and part.strip() not in exact_parts:
            exact_parts.append(part.strip())

    if exact_parts:
        return ", ".join(exact_parts[:3])

    from_display_name = ", ".join(
        part.strip()
        for part in (display_name or "").split(",")
        if part.strip()
    )

    if from_display_name:
        return ", ".join(from_display_name.split(", ")[:3])

    formatted_latitude = format_coordinate(latitude)
    formatted_longitude = format_coordinate(longitude)

    if formatted_latitude and formatted_longitude:
        return f"{formatted_latitude}, {formatted_longitude}"

    return ""


def _safe_cache_key(prefix, *parts):
    raw = ":".join(str(part).strip().lower() for part in parts)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return f"{prefix}:{digest}"


def _provider_base_url():
    base_url = getattr(
        settings,
        "GEOCODING_PROVIDER_BASE_URL",
        f"https://{DEFAULT_GEOCODING_PROVIDER_HOST}",
    )
    return str(base_url or "").strip().rstrip("/")


def _setting_or_env(name, default=""):
    value = getattr(settings, name, None)

    if value is None:
        value = os.getenv(name, default)

    return value


def _as_bool(value, default=False):
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def _provider_allowed_hosts():
    raw_hosts = _setting_or_env(
        "GEOCODING_ALLOWED_HOSTS",
        DEFAULT_GEOCODING_PROVIDER_HOST,
    )

    if isinstance(raw_hosts, str):
        hosts = raw_hosts.split(",")
    else:
        hosts = raw_hosts or []

    return {
        str(host).strip().lower().rstrip(".")
        for host in hosts
        if str(host).strip()
    }


def _provider_requires_https():
    default = not bool(getattr(settings, "DEBUG", False))
    raw_value = _setting_or_env("GEOCODING_REQUIRE_HTTPS", default)
    return _as_bool(raw_value, default=default)


def _validated_provider_base_url():
    base_url = _provider_base_url()

    if not base_url:
        raise GeocodingError("Geocoding provider URL is not configured.")

    parsed = urlparse(base_url)

    if parsed.scheme not in ("http", "https"):
        raise GeocodingError("Geocoding provider URL must use http or https scheme.")

    if _provider_requires_https() and parsed.scheme != "https":
        raise GeocodingError("Geocoding provider URL must use https.")

    if not parsed.hostname:
        raise GeocodingError("Geocoding provider URL must include a hostname.")

    if parsed.username or parsed.password:
        raise GeocodingError("Geocoding provider URL must not include credentials.")

    if parsed.query or parsed.fragment:
        raise GeocodingError("Geocoding provider URL must not include query strings or fragments.")

    provider_host = parsed.hostname.lower().rstrip(".")
    allowed_hosts = _provider_allowed_hosts()

    if not allowed_hosts:
        raise GeocodingError("At least one geocoding provider host must be allowlisted.")

    if provider_host not in allowed_hosts:
        raise GeocodingError("Geocoding provider host is not allowlisted.")

    return base_url


def _provider_user_agent():
    return getattr(settings, "GEOCODING_PROVIDER_USER_AGENT", "Tidemate/1.0")


def _provider_timeout():
    return float(getattr(settings, "GEOCODING_TIMEOUT_SECONDS", 4.0))


class _NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise HTTPError(
            req.full_url,
            code,
            "Geocoding provider redirects are not allowed.",
            headers,
            fp,
        )


def _fetch_json(path, params):
    url = f"{_validated_provider_base_url()}/{path.lstrip('/')}?{urlencode(params)}"

    request = Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": _provider_user_agent(),
        },
    )

    opener = build_opener(_NoRedirectHandler)

    try:
        with opener.open(request, timeout=_provider_timeout()) as response:  # nosec B310
            if response.status != 200:
                raise GeocodingError("Geocoding provider returned an unexpected status.")

            payload = response.read().decode("utf-8")
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        logger.warning("Geocoding provider request failed: %s", exc.__class__.__name__)
        raise GeocodingError("Could not contact geocoding provider.") from exc

    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        raise GeocodingError("Geocoding provider returned invalid JSON.") from exc


def normalize_search_result(result):
    if not isinstance(result, dict):
        return None

    latitude = validate_latitude(result.get("lat"))
    longitude = validate_longitude(result.get("lon"))

    if latitude is None or longitude is None:
        return None

    address = result.get("address") or {}
    display_name = result.get("display_name") or ""
    place_id = result.get("place_id") or f"{latitude}-{longitude}"

    return {
        "id": str(place_id),
        "place_id": place_id,
        "lat": format_coordinate(latitude),
        "lon": format_coordinate(longitude),
        "latitude": latitude,
        "longitude": longitude,
        "display_name": display_name,
        "address": address,
        "location_name": _get_city_or_county(address, display_name),
        "pickup_address": _get_exact_address(address, display_name, latitude, longitude),
    }


def normalize_reverse_result(result, latitude, longitude):
    if not isinstance(result, dict):
        result = {}

    address = result.get("address") or {}
    display_name = result.get("display_name") or ""

    return {
        "location_name": _get_city_or_county(address, display_name),
        "pickup_address": _get_exact_address(address, display_name, latitude, longitude),
    }


def search_places(query):
    cleaned_query = " ".join(str(query or "").split())

    if len(cleaned_query) < 2:
        return []

    max_length = int(getattr(settings, "GEOCODING_QUERY_MAX_LENGTH", 120))

    if len(cleaned_query) > max_length:
        raise ValueError(f"Search query must be at most {max_length} characters.")

    limit = int(getattr(settings, "GEOCODING_SEARCH_LIMIT", 5))
    country_codes = getattr(settings, "GEOCODING_COUNTRY_CODES", ["no"])

    cache_key = _safe_cache_key(
        SEARCH_CACHE_PREFIX,
        cleaned_query,
        limit,
        ",".join(country_codes),
    )

    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    params = {
        "format": "jsonv2",
        "addressdetails": "1",
        "limit": str(limit),
        "q": cleaned_query,
    }

    if country_codes:
        params["countrycodes"] = ",".join(country_codes)

    raw_results = _fetch_json("search", params)

    if not isinstance(raw_results, list):
        raise GeocodingError("Geocoding provider returned an invalid search response.")

    results = [normalize_search_result(result) for result in raw_results]
    results = [result for result in results if result]

    cache.set(
        cache_key,
        results,
        timeout=int(getattr(settings, "GEOCODING_SEARCH_CACHE_SECONDS", 60 * 60 * 24)),
    )

    return results


def reverse_geocode(latitude, longitude):
    rounded_latitude = validate_latitude(latitude)
    rounded_longitude = validate_longitude(longitude)

    if rounded_latitude is None or rounded_longitude is None:
        raise ValueError("Invalid latitude or longitude.")

    cache_key = _safe_cache_key(REVERSE_CACHE_PREFIX, rounded_latitude, rounded_longitude)
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    raw_result = _fetch_json(
        "reverse",
        {
            "format": "jsonv2",
            "addressdetails": "1",
            "zoom": "18",
            "lat": format_coordinate(rounded_latitude),
            "lon": format_coordinate(rounded_longitude),
        },
    )

    result = normalize_reverse_result(raw_result, rounded_latitude, rounded_longitude)

    cache.set(
        cache_key,
        result,
        timeout=int(getattr(settings, "GEOCODING_REVERSE_CACHE_SECONDS", 60 * 60 * 24 * 7)),
    )

    return result