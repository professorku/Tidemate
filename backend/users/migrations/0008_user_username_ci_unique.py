from django.db import migrations


INDEX_NAME = "users_user_username_ci_unique"


def assert_no_case_insensitive_duplicate_usernames(apps, schema_editor):
    User = apps.get_model("auth", "User")

    seen = {}
    duplicates = []

    users = (
        User.objects
        .exclude(username="")
        .order_by("id")
        .values("id", "username")
    )

    for user in users:
        normalized_username = (user["username"] or "").strip().lower()

        if not normalized_username:
            continue

        if normalized_username in seen:
            duplicates.append(
                (
                    seen[normalized_username],
                    (user["id"], user["username"]),
                )
            )
            continue

        seen[normalized_username] = (user["id"], user["username"])

    if duplicates:
        formatted_duplicates = ", ".join(
            f"{first[1]} (id={first[0]}) / {second[1]} (id={second[0]})"
            for first, second in duplicates
        )

        raise RuntimeError(
            "Cannot create case-insensitive username uniqueness index because "
            f"duplicate usernames already exist: {formatted_duplicates}. "
            "Rename or merge the duplicate users before running this migration."
        )


def create_case_insensitive_unique_username_index(apps, schema_editor):
    """
    Enforce case-insensitive uniqueness for Django's built-in auth_user.username.

    Django's default username field is unique, but many databases treat that
    uniqueness as case-sensitive. The signup serializer already checks
    username__iexact, but only the database can close race conditions where two
    requests try to create case-variant usernames at the same time.
    """
    vendor = schema_editor.connection.vendor
    table_name = schema_editor.quote_name("auth_user")
    index_name = schema_editor.quote_name(INDEX_NAME)

    if vendor in {"postgresql", "sqlite"}:
        schema_editor.execute(
            f"CREATE UNIQUE INDEX IF NOT EXISTS {index_name} "
            f"ON {table_name} (LOWER(username)) "
            f"WHERE username <> ''"
        )
        return

    raise RuntimeError(
        "Case-insensitive username uniqueness migration only supports "
        "PostgreSQL and SQLite. Add an equivalent unique functional index "
        "for this database backend before deploying."
    )


def drop_case_insensitive_unique_username_index(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    index_name = schema_editor.quote_name(INDEX_NAME)

    if vendor in {"postgresql", "sqlite"}:
        schema_editor.execute(f"DROP INDEX IF EXISTS {index_name}")
        return

    raise RuntimeError(
        "Case-insensitive username uniqueness migration only supports "
        "PostgreSQL and SQLite."
    )


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_profile_pending_email_ci_unique"),
    ]

    operations = [
        migrations.RunPython(
            assert_no_case_insensitive_duplicate_usernames,
            migrations.RunPython.noop,
        ),
        migrations.RunPython(
            create_case_insensitive_unique_username_index,
            drop_case_insensitive_unique_username_index,
        ),
    ]