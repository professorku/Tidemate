from django.db import migrations


INDEX_NAME = "users_user_email_ci_unique"


def create_case_insensitive_unique_email_index(apps, schema_editor):
    """
    Enforce case-insensitive uniqueness for Django's built-in auth_user.email.

    Django's default User.email field is not unique. The application already
    validates email uniqueness in serializers, but only the database can close
    the race condition where two requests create/change to the same email at
    the same time.

    The partial condition keeps Django-compatible blank emails possible for
    existing admin/service accounts, while every real email must be unique
    regardless of letter casing.
    """
    vendor = schema_editor.connection.vendor
    table_name = schema_editor.quote_name("auth_user")
    index_name = schema_editor.quote_name(INDEX_NAME)

    if vendor in {"postgresql", "sqlite"}:
        schema_editor.execute(
            f"CREATE UNIQUE INDEX IF NOT EXISTS {index_name} "
            f"ON {table_name} (LOWER(email)) "
            f"WHERE email <> ''"
        )
        return

    # TideMate is developed/deployed with SQLite/PostgreSQL. For other DBs,
    # keep the migration explicit instead of silently pretending the protection
    # exists.
    raise RuntimeError(
        "Case-insensitive email uniqueness migration only supports "
        "PostgreSQL and SQLite. Add an equivalent unique functional index "
        "for this database backend before deploying."
    )


def drop_case_insensitive_unique_email_index(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    index_name = schema_editor.quote_name(INDEX_NAME)

    if vendor in {"postgresql", "sqlite"}:
        schema_editor.execute(f"DROP INDEX IF EXISTS {index_name}")
        return

    raise RuntimeError(
        "Case-insensitive email uniqueness migration only supports "
        "PostgreSQL and SQLite."
    )


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0004_profile_pending_email"),
    ]

    operations = [
        migrations.RunPython(
            create_case_insensitive_unique_email_index,
            drop_case_insensitive_unique_email_index,
        ),
    ]