# TideMate

**TideMate** is a full-stack boat-rental marketplace inspired by Airbnb-style booking flows. Users can browse boats, create listings, request bookings, manage rentals, save favorites, write reviews, chat in real time, and receive notifications.

The project was built as a **personal portfolio project** with a focus on practical full-stack architecture, secure authentication, object-level authorization, image-upload safety, location privacy, real-time communication, and clean marketplace user flows.

> **Status:** TideMate is functional and actively developed. It is suitable as a portfolio/demo project, but should still be treated as a prototype until the production checklist is completed.

---

## Table of Contents

- [Overview](#overview)
- [Key Highlights](#key-highlights)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Security Highlights](#security-highlights)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Local Development](#local-development)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [WebSocket Setup](#websocket-setup)
- [Environment Files](#environment-files)
- [Running Checks and Tests](#running-checks-and-tests)
- [Production Checklist](#production-checklist)
- [Known Limitations](#known-limitations)
- [What This Project Demonstrates](#what-this-project-demonstrates)

---

## Overview

TideMate is a marketplace where boat owners can list boats and renters can search, book, and communicate with hosts.

The app includes:

- a Django REST API backend
- a React/Vite frontend
- secure cookie-based JWT authentication
- CSRF-aware API communication
- boat listings with multi-image upload
- client-side and server-side image validation
- booking flows for renters and hosts
- favorites, reviews, chat, and notifications
- WebSocket-based real-time updates
- location search and map-based pickup location handling
- privacy-aware location display

The goal is not only to show that the app works, but also to demonstrate how a full-stack marketplace can be designed with realistic security, authorization, validation, and user experience concerns in mind.

---

## Key Highlights

- **Secure authentication:** HttpOnly JWT cookies, CSRF protection, refresh-token rotation, token blacklisting, and device/session tracking.
- **Marketplace domain logic:** listings, bookings, favorites, reviews, chat, and notifications.
- **Booking safety:** booking actions are validated, and booking creation/confirmation is designed to avoid invalid overlapping states.
- **Image-upload safety:** frontend validation plus backend validation with MIME/type checks, size limits, Pillow verification, and image re-encoding.
- **Location privacy:** public users see approximate listing locations, while exact pickup details are limited to authorized users and relevant booking contexts.
- **Realtime UX:** WebSocket chat and notification flows.
- **Portfolio-friendly structure:** feature-based frontend folders and separated backend apps.

---

## Tech Stack

### Frontend

- **React**
- **Vite**
- **React Router**
- **Tailwind CSS**
- **Axios**
- **TanStack Query**
- **Leaflet**
- **WebSockets**
- **Vitest / Testing Library**
- **Playwright**

### Backend

- **Django**
- **Django REST Framework**
- **SimpleJWT**
- **Django Channels**
- **Pillow**
- **SQLite** for simple local development
- **PostgreSQL** recommended for production
- **Redis** for production Channels/cache/throttling setups

---

## Features

### Account and Authentication

- User registration
- Login and logout
- Email verification
- Password reset/change flows
- Safer email-change flow
- Profile pages
- Public host profiles
- Device/session tracking and revocation
- Case-insensitive uniqueness protection for important identity fields

### Boat Listings

- Host dashboard
- Create, edit, and delete listings
- Multi-image upload
- Cover-image selection
- Client-side image validation before upload
- Server-side image validation and sanitization
- Search and filtering
- Map/location support
- Public listing pages
- Host-only listing management

### Bookings

- Renters can request bookings
- Hosts can confirm or cancel booking requests
- Booking status tracking
- Booking detail pages
- Protection against invalid booking actions
- Host and renter booking views

### Marketplace UX

- Favorite boats
- Reviews
- Direct host/renter messaging
- Boat-specific direct conversations
- Booking-related conversations
- Real-time notifications
- Responsive UI

### Location Features

- Location search/geocoding
- Map-based pickup selection
- Public approximate location display
- Private exact pickup address handling
- Pickup instructions for authorized users

---

## Architecture

TideMate uses a separated frontend/backend architecture.

```text
Browser
  |
  | React/Vite frontend
  |
  | HTTP /api requests + WebSocket /ws connections
  v
Django REST Framework API + Django Channels
  |
  | ORM
  v
Database
```

The frontend uses a centralized API client so authentication, CSRF handling, refresh behavior, and error normalization are handled consistently.

The backend is split into domain-focused Django apps, keeping account logic, listings, bookings, chat, notifications, reviews, favorites, and geocoding concerns separated.

---

## Security Highlights

TideMate includes several security-focused decisions beyond a basic CRUD project.

### Authentication and Sessions

- JWTs are stored in **HttpOnly cookies** instead of `localStorage`.
- Unsafe cookie-authenticated requests use **CSRF protection**.
- Access tokens are short-lived.
- Refresh tokens support rotation and blacklisting.
- Logout revokes refresh/device session state.
- Password and account changes can revoke existing sessions.
- Login errors avoid leaking account state.
- Email verification is required before normal login.
- Device sessions are tracked and can be revoked.

### Authorization

Object-level access checks are used across important resources:

- boat listings
- bookings
- conversations
- chat messages
- favorites
- reviews
- notifications

Examples:

- Hosts can only manage their own listings.
- Renters and hosts can only access bookings they are part of.
- Chat conversations are restricted to participants.
- Direct conversations can preserve the boat/listing context.
- Private user/profile data is not exposed through public endpoints.

### Upload and Input Validation

Image upload handling is validated on both the frontend and backend.

Frontend checks include:

- maximum number of listing images
- maximum file size
- allowed image MIME types/extensions

Backend checks include:

- file extension validation
- MIME/content-type validation
- max file size
- image format validation
- image dimension/pixel limits
- Pillow image verification
- EXIF-aware processing
- image re-encoding/sanitization
- safe randomized filenames

### Location Privacy

TideMate avoids exposing exact pickup details publicly.

- Public users see approximate listing locations.
- Exact pickup information is limited to authorized users.
- Pickup instructions are not exposed on public listing views.
- Location text is filtered to reduce accidental leakage of exact addresses or coordinates.

### WebSocket Security

- WebSockets require authentication.
- WebSocket origins are validated.
- Chat and notification sockets check access.
- Chat events are restricted to conversation participants.
- Expired sessions are handled.
- Chat actions are rate-limited.

### Production Security Settings

The production settings include support for:

- secure cookies
- HSTS
- SSL redirect
- allowed hosts
- trusted CSRF origins
- stricter deployment checks
- Content Security Policy configuration
- safer production defaults

---

## Project Structure

```text
TideMate/
├── backend/                  # Django backend
│   ├── bookings/             # Booking creation, confirmation, cancellation, rules
│   ├── chat/                 # Conversations, messages, WebSocket consumers
│   ├── config/               # Django settings, routing, ASGI/WSGI config
│   ├── favorites/            # Favorite listings
│   ├── geocoding/            # Location/geocoding helpers and API endpoints
│   ├── listings/             # Boat listings, images, search, location privacy
│   ├── notifications/        # Notification creation and delivery
│   ├── reviews/              # Boat/user reviews
│   └── users/                # Auth, profiles, email verification, device sessions
│
├── frontend/                 # React/Vite frontend
│   └── src/
│       ├── api/              # Central API client and domain API wrappers
│       ├── components/       # Shared UI/layout components
│       ├── context/          # Auth, toast, notification contexts
│       ├── features/         # Feature-based UI modules
│       └── utils/            # Shared frontend utilities
│
├── docs/                     # Screenshots and documentation assets
├── compose.yaml              # Local Docker/development setup, if used
├── compose.prod.yml          # Production-oriented Docker setup, if used
└── README.md
```

---

## Screenshots

> The paths below assume screenshots exist in `docs/screenshots/`.

### Homepage

<img src="docs/screenshots/homepage.png" alt="TideMate homepage" width="900">

### My Bookings

<img src="docs/screenshots/my-bookings.png" alt="TideMate my bookings page" width="900">

### Host Bookings

<img src="docs/screenshots/host-bookings.png" alt="TideMate host bookings page" width="900">

---

## Local Development

Recommended local URLs:

```text
Backend:  http://localhost:8000
Frontend: http://localhost:5173
```

Avoid mixing `localhost` and `127.0.0.1` unless the backend CORS, CSRF, cookie, and frontend environment settings are updated consistently.

The frontend can call:

```text
/api/...
```

and Vite can proxy those requests to Django at:

```text
http://localhost:8000
```

This keeps local cookies and CSRF behavior predictable.

---

## Backend Setup

From the project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver localhost:8000
```

The backend should now be running at:

```text
http://localhost:8000
```

---

## Frontend Setup

Open a new terminal from the project root:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the app in the browser from the Vite URL, usually:

```text
http://localhost:5173
```

---

## WebSocket Setup

TideMate uses WebSockets for chat and real-time notifications.

In local development, the frontend should connect to the Django ASGI server for `/ws/...` routes.

Example Vite proxy entry:

```js
"/ws": {
  target: "ws://localhost:8000",
  ws: true,
  changeOrigin: true,
}
```

For production, WebSocket traffic should be routed to the Django ASGI server:

```text
/api/*   -> Django backend
/ws/*    -> Django ASGI server
/media/* -> production media storage or media-serving layer
```

If the frontend and backend are deployed on different domains, configure the frontend WebSocket base URL explicitly. CORS, CSRF trusted origins, allowed hosts, cookie settings, and WebSocket origins must all match the deployed domains.

---

## Environment Files

The repository expects separate environment files for backend and frontend development:

```text
backend/.env
frontend/.env
```

Use the provided example files as templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Real secrets should never be committed.

Before sharing or submitting the project, check that private/local files are not included:

```bash
find . -name ".env" \
  -o -name "*.pem" \
  -o -name "*.key" \
  -o -name "db.sqlite3" \
  -o -name ".DS_Store" \
  -o -name "__MACOSX"
```

Recommended cleanup before committing or zipping:

```bash
find . -type d -name "__pycache__" -prune -exec rm -rf {} +
find . -type d -name ".pytest_cache" -prune -exec rm -rf {} +
find . -name ".DS_Store" -delete
```

---

## Running Checks and Tests

### Backend

From the backend folder:

```bash
python manage.py makemigrations --check --dry-run
python manage.py check
python manage.py test
```

To test the main app areas:

```bash
python manage.py test bookings reviews users listings chat notifications favorites
```

Recommended production-oriented check:

```bash
python manage.py check --deploy --settings=config.settings.prod
```

### Frontend

From the frontend folder:

```bash
npm install
npm run lint
npm test
npm run build
```

Optional dependency/security checks:

```bash
pip-audit
npm audit
```

---

## Production Checklist

TideMate should not be treated as a real public marketplace until the production checklist is completed.

### Required Production Configuration

- Use PostgreSQL instead of SQLite.
- Set `DEBUG=False`.
- Use a strong production `SECRET_KEY`.
- Configure `ALLOWED_HOSTS`.
- Configure CORS allowed origins.
- Configure CSRF trusted origins.
- Use HTTPS only.
- Enable secure cookies.
- Enable HSTS only after HTTPS is confirmed working.
- Use Redis for Django Channels.
- Use Redis or another shared cache for throttling.
- Configure a real email backend.
- Store secrets in environment variables.
- Restrict and monitor Django admin access.

### Media and Upload Hardening

- Store uploaded files outside the source tree.
- Use production media storage such as S3, Cloudflare R2, Azure Blob Storage, or Google Cloud Storage.
- Ensure uploaded files cannot execute as code.
- Apply upload limits at the reverse proxy level.
- Serve media through a dedicated media layer or CDN.

### Frontend and Deployment Security

- Confirm the production nginx/reverse-proxy configuration matches the intended deployment path.
- Ensure WebSocket URLs use `wss://` in production.
- Confirm CORS, CSRF, cookies, and WebSocket origins all match the deployed domains.
- Review and tighten the Content Security Policy.
- Avoid `unsafe-inline` where possible.
- Configure frontend environment variables explicitly.

### Monitoring and Abuse Prevention

- Monitor failed login attempts.
- Monitor password resets.
- Monitor email changes.
- Monitor suspicious uploads.
- Monitor booking creation and cancellation activity.
- Add moderation tools for listings, reviews, and chat.
- Add audit logging for sensitive actions.

---

## Known Limitations

The project is functional, but the following areas should be improved before it is treated as a real marketplace:

- Payment handling is not implemented.
- Deposit and refund logic is not implemented.
- Host/renter identity verification is not implemented.
- Insurance/legal workflows are not implemented.
- Production-grade media storage is not yet configured.
- Some frontend areas need stronger automated test coverage.
- Moderation and abuse-reporting tools should be expanded.
- Production monitoring and alerting are not yet configured.

---

## Future Hardening Ideas

The booking service uses transactional logic to avoid invalid booking states. For a real production marketplace running on PostgreSQL, this could be strengthened further with a partial GiST exclusion constraint that prevents overlapping confirmed bookings for the same boat at the database level.

Conceptually:

- same `boat_id`
- overlapping `[start_date, end_date)` date range
- only where `status = "confirmed"`

This would protect the database even if future code accidentally bypassed the booking service layer.

Other possible hardening improvements:

- payment provider integration
- host/renter verification
- stronger moderation workflows
- production object storage
- structured logging and monitoring
- more end-to-end tests for critical flows

---

## What This Project Demonstrates

TideMate demonstrates practical experience with:

- full-stack web development
- REST API design
- Django backend architecture
- React frontend architecture
- authentication and authorization
- secure cookie-based JWT sessions
- CSRF-aware frontend/backend communication
- email verification and account-management flows
- file upload validation and image sanitization
- relational data modeling
- object-level permissions
- real-time communication with WebSockets
- frontend routing and API integration
- marketplace-style booking workflows
- location privacy and map-based UX
- security-conscious design for a full-stack web application

---

## Current Status

TideMate is a functional full-stack marketplace prototype with a strong focus on backend architecture, authentication, authorization, validation, image upload safety, location privacy, real-time communication, and user-facing marketplace features.

It is suitable as a portfolio project and can be improved further with more frontend tests, stronger production deployment hardening, and real marketplace infrastructure such as payments, verification, moderation, and monitoring.
