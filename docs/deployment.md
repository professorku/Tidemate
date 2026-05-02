# Production Deployment

This document explains the basic production deployment setup for Tidemate.

This is a deployment skeleton. It is meant to make the project easier to deploy, test, and review. It is not tied to one specific cloud provider yet.

## Services

The production Docker Compose setup contains:

- `frontend`: Nginx serving the built React/Vite frontend
- `backend`: Django, DRF, and Channels served with Daphne
- `postgres`: PostgreSQL database
- `redis`: Redis for Channels and runtime services

## Environment file

The project includes this safe template:

```text
.env.production.example
```

For a real deployment, create a local/server-only file:

```bash
cp .env.production.example .env.production
```

Then edit `.env.production` with real values for your own server, for example:

- real domain names
- real Django secret key
- real database password
- real email/SMTP settings

Do not commit `.env.production`.

Only `.env.production.example` should be committed.

## Validate the Docker Compose config

```bash
docker compose -f compose.prod.yml --env-file .env.production config
```

## Start the production stack

```bash
docker compose -f compose.prod.yml --env-file .env.production up -d --build
```

## Stop the production stack

```bash
docker compose -f compose.prod.yml --env-file .env.production down
```

## Logs

Show all logs:

```bash
docker compose -f compose.prod.yml --env-file .env.production logs -f
```

Show only backend logs:

```bash
docker compose -f compose.prod.yml --env-file .env.production logs -f backend
```

## Database migrations

The current backend container runs migrations automatically on startup.

Manual command:

```bash
docker compose -f compose.prod.yml --env-file .env.production exec backend python manage.py migrate
```

## Static files

The current backend container runs `collectstatic` automatically on startup.

Manual command:

```bash
docker compose -f compose.prod.yml --env-file .env.production exec backend python manage.py collectstatic --noinput
```

## Create admin user

```bash
docker compose -f compose.prod.yml --env-file .env.production exec backend python manage.py createsuperuser
```

## Health checks

The production Compose setup includes health checks for:

- PostgreSQL
- Redis
- backend
- frontend

The backend health endpoint is:

```text
/api/users/health/
```

See `docs/monitoring.md` for monitoring notes.

## Backup database

```bash
docker compose -f compose.prod.yml --env-file .env.production exec postgres pg_dump -U tidemate tidemate > tidemate-backup.sql
```

## Restore database

```bash
cat tidemate-backup.sql | docker compose -f compose.prod.yml --env-file .env.production exec -T postgres psql -U tidemate tidemate
```

## Production checklist

Before exposing the app publicly:

- `DEBUG=False`
- strong `SECRET_KEY`
- strong `LOCATION_PRIVACY_SALT`
- strong database password
- real production domain in `ALLOWED_HOSTS`
- real production origins in CSRF/CORS/WebSocket settings
- HTTPS enabled
- database backups configured
- monitoring configured
- email sending tested
- WebSocket connection tested
- image upload tested
- admin account secured