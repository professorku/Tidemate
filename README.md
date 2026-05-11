# TideMate

TideMate is a full-stack boat rental marketplace where users can browse boats, publish listings, request bookings, manage trips, save favorites, write reviews, report content, chat in real time, and receive notifications.

This is a personal portfolio project focused on building a realistic marketplace-style app with secure authentication, booking flows, payments, image uploads, location privacy, realtime features, moderation, and production-minded deployment.

> Status: functional and actively developed. TideMate is suitable as a portfolio/demo project, but it should still be treated as a prototype rather than a real public marketplace.

Live demo:

```text
https://tidemate.macjms.dev
```

Detailed architecture notes are kept separately in [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Features

- Public boat search and listing pages
- Host listing creation, editing, deletion, and image upload
- Multi-image listings with cover image selection
- Booking requests, host confirmation, cancellation, and booking detail pages
- Stripe Checkout flow for booking payments
- Favorites and reviews
- User profiles and public host profiles
- Direct messaging and booking/listing-related conversations
- WebSocket chat and realtime notifications
- Report listing/user/review/message functionality
- Admin moderation page for reviewing reports
- Location search, map-based pickup selection, and approximate public map display
- Marine/weather condition cards for listings
- About project page for external reviewers

---

## Tech stack

### Backend

- Django 6
- Django REST Framework
- Django Channels with Daphne
- SimpleJWT with HttpOnly cookie-based auth
- PostgreSQL/PostGIS in production
- Redis for Channels/cache/runtime services
- Pillow for image validation and processing
- Stripe Checkout
- Google OAuth verification
- Cloudflare Turnstile verification

### Frontend

- React 19
- Vite 7
- React Router 7
- Tailwind CSS
- Axios
- TanStack Query
- Leaflet / React Leaflet
- Vitest, Testing Library, and Playwright

### Deployment and tooling

- Docker and Docker Compose
- Frontend Nginx container
- Django ASGI backend container
- PostgreSQL/PostGIS container
- Redis container
- Maintenance worker container
- GitHub Actions CI
- Dependabot
- Semgrep, Bandit, pip-audit, npm audit, and detect-secrets

---

## Security and privacy highlights

TideMate goes beyond a basic CRUD app in several areas:

- JWT access and refresh tokens are stored in HttpOnly cookies, not localStorage.
- CSRF protection is used for unsafe cookie-authenticated requests.
- Refresh-token rotation, token blacklisting, logout cleanup, and device/session tracking are implemented.
- Email verification, password reset, password change, and safer email-change flows are included.
- Important endpoints use object-level permission checks.
- Hosts can only manage their own boats.
- Renters and hosts can only access bookings they are involved in.
- Chat conversations and messages are restricted to participants.
- Listing images are validated on both frontend and backend.
- Backend image handling checks extension, MIME/content type, size, format, dimensions, and uses Pillow verification/sanitization.
- Exact pickup details are kept private and only exposed to authorized users in the correct booking context.
- WebSocket connections authenticate with the cookie session and validate conversation/notification access.

---

## Documentation

The README is intentionally kept short. More detail lives in dedicated docs:

```text
ARCHITECTURE.md        Codebase organization and development rules
docs/api.md           Main backend API endpoints
docs/deployment.md    Production deployment commands and notes
docs/monitoring.md    Monitoring and operations checklist
```

---

## Local development

Recommended local URLs:

```text
Backend:  http://localhost:8000
Frontend: http://localhost:5173
```

Avoid mixing `localhost` and `127.0.0.1` unless CORS, CSRF, cookies, and frontend environment variables are updated consistently.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver localhost:8000
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend normally uses `/api` and relies on the Vite proxy in development. This avoids unnecessary CORS/CSRF problems from hard-coded localhost URLs.

---

## Environment files

Use the example files as templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.production.example .env.production
```

Do not commit real secrets.

Important production values include:

```text
SECRET_KEY
LOCATION_PRIVACY_SALT
ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS
WEBSOCKET_ALLOWED_ORIGINS
POSTGRES_PASSWORD
EMAIL_* settings
GOOGLE_OAUTH_CLIENT_ID
VITE_GOOGLE_OAUTH_CLIENT_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
TURNSTILE_SECRET_KEY
VITE_TURNSTILE_SITE_KEY
```

For `ALLOWED_HOSTS`, use hostnames only, not full URLs:

```env
ALLOWED_HOSTS=tidemate.macjms.dev,localhost,127.0.0.1
```

For CORS, CSRF, WebSocket, frontend, and backend URLs, use full origins:

```env
CORS_ALLOWED_ORIGINS=https://tidemate.macjms.dev
CSRF_TRUSTED_ORIGINS=https://tidemate.macjms.dev
WEBSOCKET_ALLOWED_ORIGINS=https://tidemate.macjms.dev
FRONTEND_URL=https://tidemate.macjms.dev
BACKEND_URL=https://tidemate.macjms.dev
```

---

## Useful commands

### Backend

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Production-oriented Django check:

```bash
DJANGO_SETTINGS_MODULE=config.settings.prod python manage.py check --deploy
```

### Frontend

```bash
cd frontend
npm run lint
npm run test
npm run build
npm run e2e
```

### Cleanup

```bash
make clean
```

---

## Production deployment

The production-oriented Compose file is:

```text
compose.prod.yml
```

Start or rebuild the whole stack:

```bash
docker compose --env-file .env.production -f compose.prod.yml up -d --build
```

Rebuild only the frontend:

```bash
docker compose --env-file .env.production -f compose.prod.yml up -d --no-deps --build frontend
```

Rebuild only the backend:

```bash
docker compose --env-file .env.production -f compose.prod.yml up -d --no-deps --build backend
```

Show logs:

```bash
docker compose --env-file .env.production -f compose.prod.yml logs -f
```

The production stack expects an HTTPS reverse proxy in front of the frontend container. The frontend container is bound to `127.0.0.1:8080` by default, and public traffic should go through HTTPS/WSS.

More deployment details are in [`docs/deployment.md`](docs/deployment.md).

---

## CI and security checks

The repository includes workflows for:

- Backend Django checks and tests
- Backend production deploy checks
- Frontend linting, tests, and build
- Playwright smoke tests
- Secret scanning
- Python and frontend dependency audits
- Bandit and Semgrep security scans
- Dependabot updates

---

## Known limitations

TideMate is still a portfolio/demo project. Before treating it as a real public marketplace, these areas should be improved:

- Refunds, deposits, disputes, and chargeback workflows around payments
- Host/renter identity verification
- Insurance/legal flows
- Production object storage for uploaded media
- Stronger production monitoring and alerting
- More end-to-end test coverage for critical booking/payment/moderation flows
- More complete moderation and abuse-handling workflows

---

## What this project demonstrates

TideMate demonstrates practical experience with full-stack web development, Django REST APIs, React/Vite, secure cookie-based authentication, CSRF-aware API communication, object-level authorization, image upload safety, marketplace booking logic, Stripe integration, WebSockets, location privacy, Docker deployment, CI, and production-readiness thinking.
