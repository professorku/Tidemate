from django.db import migrations


INDEX_NAME = "users_profile_pending_email_ci_unique"


def normalize_existing_pending_emails(apps, schema_editor):
    Profile = apps.get_model("users", "Profile")

    seen = set()

    profiles = (
        Profile.objects
        .exclude(pending_email__isnull=True)
        .exclude(pending_email="")
        .order_by("pending_email_requested_at", "id")
    )

    for profile in profiles:
        normalized_email = (profile.pending_email or "").strip().lower()

        if not normalized_email:
            profile.pending_email = None
            profile.pending_email_requested_at = None
            profile.save(update_fields=["pending_email", "pending_email_requested_at"])
            continue

        if normalized_email in seen:
            profile.pending_email = None
            profile.pending_email_requested_at = None
            profile.save(update_fields=["pending_email", "pending_email_requested_at"])
            continue

        seen.add(normalized_email)

        if profile.pending_email != normalized_email:
            profile.pending_email = normalized_email
            profile.save(update_fields=["pending_email"])


def create_case_insensitive_unique_pending_email_index(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    table_name = schema_editor.quote_name("users_profile")
    index_name = schema_editor.quote_name(INDEX_NAME)

    if vendor in {"postgresql", "sqlite"}:
        schema_editor.execute(
            f"CREATE UNIQUE INDEX IF NOT EXISTS {index_name} "
            f"ON {table_name} (LOWER(pending_email)) "
            f"WHERE pending_email IS NOT NULL AND pending_email <> ''"
        )
        return

    raise RuntimeError(
        "Case-insensitive pending_email uniqueness migration only supports "
        "PostgreSQL and SQLite. Add an equivalent unique functional index "
        "for this database backend before using email-change verification."
    )


def drop_case_insensitive_unique_pending_email_index(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    index_name = schema_editor.quote_name(INDEX_NAME)

    if vendor in {"postgresql", "sqlite"}:
        schema_editor.execute(f"DROP INDEX IF EXISTS {index_name}")
        return

    raise RuntimeError(
        "Case-insensitive pending_email uniqueness migration only supports "
        "PostgreSQL and SQLite."
    )


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0006_profile_bio_max_length"),
    ]

    operations = [
        migrations.RunPython(
            normalize_existing_pending_emails,
            migrations.RunPython.noop,
        ),
        migrations.RunPython(
            create_case_insensitive_unique_pending_email_index,
            drop_case_insensitive_unique_pending_email_index,
        ),
    ]