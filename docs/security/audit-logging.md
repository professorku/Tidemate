# Audit logging privacy and retention policy

TideMate keeps audit events so administrators can investigate security-relevant activity, permission failures, unsafe API writes, and server errors. Audit logs are useful for security, but they may also contain personal data. For that reason, audit data must be limited, protected, and deleted when it is no longer needed.

## What is logged

Audit events may include:

- event timestamp
- action name, for example `auth.login`, `api.post.boat-list-create`, or `security.403`
- event status and severity
- authenticated actor user id through the `actor` relation, when available
- target type and target id, when available from URL parameters
- request id
- HTTP method
- request path without query string
- client IP address
- user agent
- sanitized metadata

## What must not be logged

Audit events must not store raw sensitive request data, including:

- request bodies
- passwords
- access tokens
- refresh tokens
- session ids
- CSRF tokens
- cookies
- authorization headers
- API keys
- client secrets
- raw email addresses/usernames in metadata when a hashed identifier is enough

The audit service sanitizes metadata keys containing sensitive words such as `password`, `token`, `secret`, `cookie`, `authorization`, `csrf`, `session`, `api_key`, `credential`, `refresh`, or `access`.

## Access policy

Audit events are visible in Django admin only to active superusers.

Staff users who are not superusers must not be able to view audit events in admin. Audit events are read-only in admin. Manual admin deletion is disabled so audit cleanup is performed consistently through the retention command.

## Retention policy

Default retention is 180 days.

Old audit events should be deleted regularly using:

```bash
python manage.py prune_audit_events --dry-run
python manage.py prune_audit_events --confirm