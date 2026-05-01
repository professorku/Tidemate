# backend/listings/services/marine_conditions.py
import json
import logging
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


MARINE_CONDITIONS_CACHE_KEY_VERSION = "v2"


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


def get_met_norway_user_agent():
    return getattr(
        settings,
        "MET_NORWAY_USER_AGENT",
        "TideMate/1.0 local-development",
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


def fetch_json(url, params, headers=None):
    query = urlencode(params, doseq=True)
    request = Request(f"{url}?{query}", headers=headers or {})

    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        logger.warning("Failed to fetch forecast JSON from %s: %s", url, exc)
        raise MarineConditionsError("External forecast service unavailable.") from exc


def parse_datetime(value):
    if not value:
        return None

    try:
        cleaned_value = str(value).replace("Z", "+00:00")
        parsed = datetime.fromisoformat(cleaned_value)

        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)

        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


def hour_key(value):
    parsed = parse_datetime(value)

    if parsed:
        return parsed.replace(minute=0, second=0, microsecond=0).isoformat()

    return str(value)[:13]


def round_optional(value, digits=1):
    if value is None:
        return None

    try:
        return round(float(value), digits)
    except (TypeError, ValueError):
        return None


def has_real_wave_data(wave_rows):
    return any(row.get("wave_height") is not None for row in wave_rows)


def classify_conditions(wind_speed, wave_height):
    wind_speed = round_optional(wind_speed, 1)
    wave_height = round_optional(wave_height, 1)

    if wind_speed is None and wave_height is None:
        return {
            "label": "Unknown",
            "message": "Not enough forecast data for this time.",
            "based_on": "none",
        }

    if wave_height is None:
        if wind_speed < 6:
            return {
                "label": "Good",
                "message": "Wave data is unavailable. Rating is based on calm wind only.",
                "based_on": "wind",
            }

        if wind_speed < 10:
            return {
                "label": "Fair",
                "message": "Wave data is unavailable. Rating is based on moderate wind only.",
                "based_on": "wind",
            }

        return {
            "label": "Rough",
            "message": "Wave data is unavailable. Wind is strong, so extra caution is advised.",
            "based_on": "wind",
        }

    if wind_speed is None:
        if wave_height < 0.8:
            return {
                "label": "Good",
                "message": "Wind data is unavailable. Rating is based on low wave height only.",
                "based_on": "waves",
            }

        if wave_height < 1.5:
            return {
                "label": "Fair",
                "message": "Wind data is unavailable. Rating is based on moderate wave height only.",
                "based_on": "waves",
            }

        return {
            "label": "Rough",
            "message": "Wind data is unavailable. Wave height is high, so extra caution is advised.",
            "based_on": "waves",
        }

    if wind_speed < 6 and wave_height < 0.8:
        return {
            "label": "Good",
            "message": "Good for a calm day trip.",
            "based_on": "waves_and_wind",
        }

    if wind_speed < 10 and wave_height < 1.5:
        return {
            "label": "Fair",
            "message": "Usable conditions, but expect some motion.",
            "based_on": "waves_and_wind",
        }

    return {
        "label": "Rough",
        "message": "More challenging conditions. Extra caution advised.",
        "based_on": "waves_and_wind",
    }


def condition_sort_score(row):
    label_scores = {
        "Good": 0,
        "Fair": 1,
        "Unknown": 2,
        "Rough": 3,
    }

    return (
        label_scores.get(row.get("label"), 2),
        row.get("wave_height_m") if row.get("wave_height_m") is not None else 999,
        row.get("wind_speed_m_s") if row.get("wind_speed_m_s") is not None else 999,
    )


def filter_to_current_and_future(rows):
    if not rows:
        return rows

    now_utc = datetime.now(timezone.utc)
    cutoff = now_utc - timedelta(hours=1)

    rows_with_dates = []
    rows_without_dates = []

    for row in rows:
        parsed = parse_datetime(row.get("time"))

        if parsed is None:
          rows_without_dates.append(row)
        else:
          rows_with_dates.append((parsed, row))

    rows_with_dates.sort(key=lambda item: item[0])

    future_rows = [
        row
        for parsed, row in rows_with_dates
        if parsed >= cutoff
    ]

    if future_rows:
        return future_rows + rows_without_dates

    return [row for _, row in rows_with_dates] + rows_without_dates


def extract_met_norway_wave_rows(ocean_data):
    timeseries = ocean_data.get("properties", {}).get("timeseries", [])
    rows = []

    for item in timeseries:
        details = (
            item.get("data", {})
            .get("instant", {})
            .get("details", {})
        )

        rows.append({
            "time": item.get("time"),
            "wave_height": round_optional(details.get("sea_surface_wave_height"), 1),
        })

    return rows


def extract_open_meteo_wave_rows(marine_data):
    hourly = marine_data.get("hourly", {})
    times = hourly.get("time", [])
    wave_heights = hourly.get("wave_height", [])

    rows = []

    for index, time_value in enumerate(times):
        rows.append({
            "time": time_value,
            "wave_height": round_optional(
                wave_heights[index] if index < len(wave_heights) else None,
                1,
            ),
        })

    return rows


def extract_open_meteo_weather_rows(weather_data):
    hourly = weather_data.get("hourly", {})
    times = hourly.get("time", [])
    wind_speeds = hourly.get("wind_speed_10m", [])
    temperatures = hourly.get("temperature_2m", [])

    rows = []

    for index, time_value in enumerate(times):
        rows.append({
            "time": time_value,
            "wind_speed": round_optional(
                wind_speeds[index] if index < len(wind_speeds) else None,
                1,
            ),
            "temperature": round_optional(
                temperatures[index] if index < len(temperatures) else None,
                1,
            ),
        })

    return rows


def fetch_met_norway_oceanforecast(latitude, longitude):
    headers = {
        "User-Agent": get_met_norway_user_agent(),
    }

    ocean_data = fetch_json(
        "https://api.met.no/weatherapi/oceanforecast/2.0/complete",
        {
            "lat": latitude,
            "lon": longitude,
        },
        headers=headers,
    )

    return extract_met_norway_wave_rows(ocean_data)


def fetch_open_meteo_marine(latitude, longitude):
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

    return extract_open_meteo_wave_rows(marine_data)


def fetch_open_meteo_weather(latitude, longitude):
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

    return extract_open_meteo_weather_rows(weather_data)


def fetch_wave_rows(latitude, longitude):
    try:
        met_rows = fetch_met_norway_oceanforecast(latitude, longitude)

        if has_real_wave_data(met_rows):
            return met_rows, "MET Norway Oceanforecast"

        logger.info("MET Norway Oceanforecast returned no usable wave data.")
    except MarineConditionsError as exc:
        logger.info("MET Norway Oceanforecast unavailable, falling back: %s", exc)

    try:
        open_meteo_rows = fetch_open_meteo_marine(latitude, longitude)

        if has_real_wave_data(open_meteo_rows):
            return open_meteo_rows, "Open-Meteo Marine"

        logger.info("Open-Meteo Marine returned no usable wave data.")
        return open_meteo_rows, "Open-Meteo Marine"
    except MarineConditionsError as exc:
        logger.info("Open-Meteo Marine unavailable: %s", exc)

    return [], "Wind forecast only"


def build_hourly_rows(wave_rows, weather_rows, data_source):
    rows = []

    weather_by_hour = {
        hour_key(row.get("time")): row
        for row in weather_rows
    }

    source_rows = wave_rows or [
        {
            "time": row.get("time"),
            "wave_height": None,
        }
        for row in weather_rows
    ]

    for index, wave_row in enumerate(source_rows):
        weather_row = weather_by_hour.get(hour_key(wave_row.get("time")))

        if weather_row is None and index < len(weather_rows):
            weather_row = weather_rows[index]

        wave_height = round_optional(wave_row.get("wave_height"), 1)
        wind_speed = round_optional((weather_row or {}).get("wind_speed"), 1)
        temperature = round_optional((weather_row or {}).get("temperature"), 1)

        rating = classify_conditions(wind_speed, wave_height)

        rows.append({
            "time": wave_row.get("time"),
            "wave_height_m": wave_height,
            "wind_speed_m_s": wind_speed,
            "air_temperature_c": temperature,
            "label": rating["label"],
            "message": rating["message"],
            "based_on": rating["based_on"],
            "data_source": data_source,
        })

    return filter_to_current_and_future(rows)


def build_conditions_payload(wave_rows, weather_rows, data_source):
    hourly_rows = build_hourly_rows(wave_rows, weather_rows, data_source)

    if not hourly_rows:
        return None

    current = hourly_rows[0]
    best_window = sorted(hourly_rows[:24], key=condition_sort_score)[0]

    has_wave_data = any(row["wave_height_m"] is not None for row in hourly_rows[:12])
    has_wind_data = any(row["wind_speed_m_s"] is not None for row in hourly_rows[:12])

    if has_wave_data and has_wind_data:
        data_note = "Rating uses wave height and wind speed."
    elif has_wave_data:
        data_note = "Wind data is unavailable. Rating uses wave height only."
    elif has_wind_data:
        data_note = "Wave data is unavailable. Rating uses wind speed only."
    else:
        data_note = "Not enough forecast data is available for this location."

    return {
        "current": current,
        "best_window_today": best_window,
        "next_12_hours": hourly_rows[:12],
        "data_source": data_source,
        "data_note": data_note,
    }


def fetch_boat_conditions(latitude, longitude):
    wave_rows, data_source = fetch_wave_rows(latitude, longitude)

    try:
        weather_rows = fetch_open_meteo_weather(latitude, longitude)
    except MarineConditionsError as exc:
        logger.info("Open-Meteo Weather unavailable: %s", exc)
        weather_rows = []

    if not wave_rows and not weather_rows:
        raise MarineConditionsError("No forecast data available from external services.")

    return build_conditions_payload(wave_rows, weather_rows, data_source)


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