import re

from django.db import migrations


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


def normalize_location_part(value):
    return (value or '').strip().strip(',')


def part_looks_private(value):
    normalized = normalize_location_part(value)
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

    parts = [normalize_location_part(part) for part in raw_value.split(',')]
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
        if not part_looks_private(part)
    ]

    if not safe_parts:
        safe_parts = [
            part for part in parts
            if not part_looks_private(part)
        ]

    if not safe_parts:
        return 'Approximate area'

    return ', '.join(safe_parts[:2])


def sanitize_existing_location_names(apps, schema_editor):
    BoatListing = apps.get_model('listings', 'BoatListing')

    for boat in BoatListing.objects.all().iterator():
        old_location_name = (boat.location_name or '').strip()
        public_location_name = get_public_location_name(old_location_name)

        fields_to_update = []

        if old_location_name and not getattr(boat, 'pickup_address', ''):
            boat.pickup_address = old_location_name
            fields_to_update.append('pickup_address')

        if public_location_name and public_location_name != old_location_name:
            boat.location_name = public_location_name
            fields_to_update.append('location_name')

        if fields_to_update:
            boat.save(update_fields=fields_to_update)


class Migration(migrations.Migration):

    dependencies = [
        ('listings', '0007_boatlisting_privacy_pickup_fields'),
    ]

    operations = [
        migrations.RunPython(
            sanitize_existing_location_names,
            reverse_code=migrations.RunPython.noop,
        ),
    ]