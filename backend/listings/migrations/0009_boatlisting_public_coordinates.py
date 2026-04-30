import hashlib
import math
from decimal import Decimal, InvalidOperation

from django.db import migrations, models


APPROXIMATE_LOCATION_MIN_OFFSET_KM = 1.5
APPROXIMATE_LOCATION_MAX_OFFSET_KM = 3.5
EARTH_RADIUS_KM = 6371.0088
PUBLIC_COORDINATE_QUANTUM = Decimal('0.000001')


def as_float(value):
    if value is None:
        return None

    try:
        decimal_value = Decimal(value)
    except (InvalidOperation, TypeError, ValueError):
        return None

    return float(decimal_value)


def round_public_coordinate(value):
    if value is None:
        return None

    return round(float(value), 4)


def round_public_coordinate_decimal(value):
    rounded_value = round_public_coordinate(value)

    if rounded_value is None:
        return None

    return Decimal(str(rounded_value)).quantize(PUBLIC_COORDINATE_QUANTUM)


def destination_point(latitude, longitude, distance_km, bearing_degrees):
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


def get_public_coordinate_decimals(listing_id, latitude, longitude):
    latitude = as_float(latitude)
    longitude = as_float(longitude)

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

    public_latitude, public_longitude = destination_point(
        latitude=latitude,
        longitude=longitude,
        distance_km=offset_distance,
        bearing_degrees=bearing,
    )

    return (
        round_public_coordinate_decimal(public_latitude),
        round_public_coordinate_decimal(public_longitude),
    )


def populate_public_coordinates(apps, schema_editor):
    BoatListing = apps.get_model('listings', 'BoatListing')

    batch = []

    for boat in BoatListing.objects.all().iterator(chunk_size=500):
        public_latitude, public_longitude = get_public_coordinate_decimals(
            listing_id=boat.pk,
            latitude=boat.latitude,
            longitude=boat.longitude,
        )

        boat.public_latitude = public_latitude
        boat.public_longitude = public_longitude
        batch.append(boat)

        if len(batch) >= 500:
            BoatListing.objects.bulk_update(
                batch,
                ['public_latitude', 'public_longitude'],
            )
            batch = []

    if batch:
        BoatListing.objects.bulk_update(
            batch,
            ['public_latitude', 'public_longitude'],
        )


def clear_public_coordinates(apps, schema_editor):
    BoatListing = apps.get_model('listings', 'BoatListing')
    BoatListing.objects.update(public_latitude=None, public_longitude=None)


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0008_sanitize_public_location_names'),
    ]

    operations = [
        migrations.AddField(
            model_name='boatlisting',
            name='public_latitude',
            field=models.DecimalField(
                blank=True,
                db_index=True,
                decimal_places=6,
                editable=False,
                max_digits=9,
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='boatlisting',
            name='public_longitude',
            field=models.DecimalField(
                blank=True,
                db_index=True,
                decimal_places=6,
                editable=False,
                max_digits=9,
                null=True,
            ),
        ),
        migrations.RunPython(
            populate_public_coordinates,
            clear_public_coordinates,
        ),
        migrations.AddIndex(
            model_name='boatlisting',
            index=models.Index(
                fields=['public_latitude', 'public_longitude'],
                name='boat_public_geo_idx',
            ),
        ),
    ]