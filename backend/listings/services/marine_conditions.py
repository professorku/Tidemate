# backend/listings/services/marine_conditions.py
import json
import logging
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


MARINE_CONDITIONS_CACHE_KEY_VERSION = "v1"


class MarineConditionsError(RuntimeError):
    pass


def get_cache_timeout_seconds():
    return int(
        getattr(
            settings,
            "MARINE_CONDITIONS_CACHE_TTL_SECONDS",
            30 * 60,
        )
    )


def normalize_coordinate(value, field_name):
    try:
        coordinate = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid {field_name}.") from exc

    if coordinate != coordinate or coordinate in (float("inf"), float("-inf")):
        raise ValueError(f"Invalid {field_name}.")

    if field_name == "latitude" and not -90 <= coordinate <= 90:
        raise ValueError("Latitude must be between -90 and 90.")

    if field_name == "longitude" and not -180 <= coordinate <= 180:
        raise ValueError("Longitude must be between -180 and 180.")

    return coordinate


def build_cache_key(latitude, longitude):
    """
    Round coordinates to avoid cache misses caused by tiny decimal differences.

    4 decimals is roughly 11 meters, which is more than precise enough for
    marine/weather forecast data and still keeps nearby but distinct locations
    reasonably separate.
    """
    rounded_latitude = round(latitude, 4)
    rounded_longitude = round(longitude, 4)

    return (
        f"marine_conditions:{MARINE_CONDITIONS_CACHE_KEY_VERSION}:"
        f"{rounded_latitude:.4f}:{rounded_longitude:.4f}"
    )


def safe_cache_get(cache_key):
    try:
        return cache.get(cache_key)
    except Exception as exc:  # pragma: no cover - defensive fallback
        logger.warning("Marine conditions cache read failed for %s: %s", cache_key, exc)
        return None


def safe_cache_set(cache_key, value, timeout):
    try:
        cache.set(cache_key, value, timeout=timeout)
    except Exception as exc:  # pragma: no cover - defensive fallback
        logger.warning("Marine conditions cache write failed for %s: %s", cache_key, exc)


def fetch_json(url, params):
    query = urlencode(params, doseq=True)

    try:
        with urlopen(f"{url}?{query}", timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        logger.warning("Failed to fetch marine/weather JSON from %s: %s", url, exc)
        raise MarineConditionsError("External forecast service unavailable.") from exc


def classify_conditions(wind_speed, wave_height):
    if wind_speed is None or wave_height is None:
        return {
            "label": "Unknown",
            "message": "Not enough forecast data for this time.",
        }

    if wind_speed < 6 and wave_height < 0.8:
        return {
            "label": "Good",
            "message": "Good for a calm day trip.",
        }

    if wind_speed < 10 and wave_height < 1.5:
        return {
            "label": "Fair",
            "message": "Usable conditions, but expect some motion.",
        }

    return {
        "label": "Rough",
        "message": "More challenging conditions. Extra caution advised.",
    }


def build_hourly_rows(times, wave_heights, wind_speeds, temperatures):
    rows = []

    for i, time_value in enumerate(times):
        wave_height = wave_heights[i] if i < len(wave_heights) else None
        wind_speed = wind_speeds[i] if i < len(wind_speeds) else None
        temperature = temperatures[i] if i < len(temperatures) else None

        rating = classify_conditions(wind_speed, wave_height)

        rows.append({
            "time": time_value,
            "wave_height_m": wave_height,
            "wind_speed_m_s": wind_speed,
            "air_temperature_c": temperature,
            "label": rating["label"],
            "message": rating["message"],
        })

    return rows


def build_conditions_payload(marine_data, weather_data):
    marine_hourly = marine_data.get("hourly", {})
    weather_hourly = weather_data.get("hourly", {})

    times = marine_hourly.get("time", [])
    wave_heights = marine_hourly.get("wave_height", [])
    wind_speeds = weather_hourly.get("wind_speed_10m", [])
    temperatures = weather_hourly.get("temperature_2m", [])

    hourly_rows = build_hourly_rows(
        times,
        wave_heights,
        wind_speeds,
        temperatures,
    )

    if not hourly_rows:
        return None

    current = hourly_rows[0]
    best_window = sorted(
        hourly_rows[:24],
        key=lambda row: (
            999 if row["label"] == "Rough" else 0,
            row["wave_height_m"] if row["wave_height_m"] is not None else 999,
            row["wind_speed_m_s"] if row["wind_speed_m_s"] is not None else 999,
        ),
    )[0]

    return {
        "current": current,
        "best_window_today": best_window,
        "next_12_hours": hourly_rows[:12],
    }


def fetch_boat_conditions(latitude, longitude):
    marine_data = fetch_json(
        "https://marine-api.open-meteo.com/v1/marine",
        {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ["wave_height"],
            "forecast_days": 3,
            "timezone": "auto",
        },
    )

    weather_data = fetch_json(
        "https://api.open-meteo.com/v1/forecast",
        {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": ["wind_speed_10m", "temperature_2m"],
            "forecast_days": 3,
            "timezone": "auto",
        },
    )

    return build_conditions_payload(marine_data, weather_data)


def get_boat_conditions(latitude, longitude):
    latitude = normalize_coordinate(latitude, "latitude")
    longitude = normalize_coordinate(longitude, "longitude")

    cache_timeout = get_cache_timeout_seconds()
    cache_key = build_cache_key(latitude, longitude)

    if cache_timeout > 0:
        cached_conditions = safe_cache_get(cache_key)

        if cached_conditions is not None:
            return cached_conditions

    conditions = fetch_boat_conditions(latitude, longitude)

    if conditions is not None and cache_timeout > 0:
        safe_cache_set(cache_key, conditions, timeout=cache_timeout)

    return conditions