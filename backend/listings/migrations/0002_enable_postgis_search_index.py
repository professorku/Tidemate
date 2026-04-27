from django.db import migrations


def enable_postgis_extensions_and_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    statements = [
        "CREATE EXTENSION IF NOT EXISTS postgis",
        (
            "CREATE INDEX IF NOT EXISTS listings_boatlisting_location_gist "
            "ON listings_boatlisting USING GIST "
            "(geography(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326))) "
            "WHERE longitude IS NOT NULL AND latitude IS NOT NULL"
        ),
        "CREATE INDEX IF NOT EXISTS listings_boatlisting_created_at_idx ON listings_boatlisting (created_at DESC)",
        "CREATE INDEX IF NOT EXISTS listings_boatlisting_boat_type_idx ON listings_boatlisting (boat_type)",
        "CREATE INDEX IF NOT EXISTS listings_boatlisting_price_per_day_idx ON listings_boatlisting (price_per_day)",
        "CREATE INDEX IF NOT EXISTS listings_boatlisting_guests_idx ON listings_boatlisting (guests)",
    ]

    with schema_editor.connection.cursor() as cursor:
        for statement in statements:
            cursor.execute(statement)


def disable_postgis_indexes(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    statements = [
        "DROP INDEX IF EXISTS listings_boatlisting_location_gist",
        "DROP INDEX IF EXISTS listings_boatlisting_created_at_idx",
        "DROP INDEX IF EXISTS listings_boatlisting_boat_type_idx",
        "DROP INDEX IF EXISTS listings_boatlisting_price_per_day_idx",
        "DROP INDEX IF EXISTS listings_boatlisting_guests_idx",
    ]

    with schema_editor.connection.cursor() as cursor:
        for statement in statements:
            cursor.execute(statement)


class Migration(migrations.Migration):
    dependencies = [
        ("listings", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            enable_postgis_extensions_and_indexes,
            disable_postgis_indexes,
        ),
    ]
