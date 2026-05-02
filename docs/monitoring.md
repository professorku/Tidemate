# Monitoring and Production Operations

This document describes the minimum monitoring setup for running Tidemate in production.

## Health check

The backend exposes a health endpoint:

- `/api/users/health/`

This endpoint can be used by:

- Docker health checks
- DigitalOcean/App Platform health checks
- uptime monitoring tools
- load balancers or reverse proxies

A healthy response should mean that the Django application is running and reachable.

## Logs to monitor

The backend should be monitored for these event types:

- repeated failed login attempts
- repeated failed refresh-token attempts
- password reset request spikes
- email change attempts
- failed image uploads
- booking creation failures
- booking cancellation spikes
- WebSocket authentication failures
- unexpected 500 errors
- admin login attempts

## Alerts

Recommended production alerts:

- backend health endpoint is down
- frontend is unreachable
- database is unreachable
- Redis is unreachable
- error rate increases above normal
- repeated authentication failures from the same IP
- disk usage is high
- database backup fails
- TLS certificate is close to expiry

## Error tracking

Recommended future setup:

- Sentry or similar error tracking for Django backend exceptions
- frontend error boundary reporting
- source maps uploaded for frontend production builds
- separate environments for development, staging, and production

## Uptime monitoring

Use an external uptime monitor against:

- `https://your-domain.com/`
- `https://your-domain.com/api/users/health/`

The monitor should alert by email or another notification channel if either endpoint fails repeatedly.

## Backups

Production should include regular PostgreSQL backups.

Minimum recommendation:

- daily database backup
- backup retention for at least 7 to 30 days
- occasional restore test to verify backups actually work

## Security monitoring

Security-relevant events should be retained long enough to investigate incidents.

Important events:

- login failures
- logout/session revocation
- password reset requests
- email change requests
- suspicious upload failures
- permission denied errors
- admin login attempts
