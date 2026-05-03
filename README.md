# TideMate

**TideMate** is a full-stack Boatbnb-style marketplace where users can list boats, book rentals, save favorites, write reviews, chat in real time, and receive notifications.

The project is built as a **student / portfolio project** with a strong focus on practical full-stack architecture, secure authentication, object-level authorization, image upload validation, real-time communication, and clean user flows.

> **Status:** TideMate is functional and under active development. It is suitable as a portfolio/demo project, but should still be treated as a prototype until the production checklist is completed.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Security Highlights](#security-highlights)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Local Development Setup](#local-development-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [WebSocket Setup](#websocket-setup)
- [Running Tests](#running-tests)
- [Environment Files](#environment-files)
- [Important Backend Apps](#important-backend-apps)
- [Local Development Notes](#local-development-notes)
- [Production Checklist](#production-checklist)
- [Known Limitations](#known-limitations)
- [What This Project Demonstrates](#what-this-project-demonstrates)

---

## Overview

TideMate lets users browse, list, and rent boats through a modern full-stack web application.

The app includes:

- a Django REST API backend
- a React/Vite frontend
- secure cookie-based JWT authentication
- CSRF-aware API communication
- boat listings with image upload
- booking flows for renters and hosts
- favorites, reviews, chat, and notifications
- map/location functionality
- WebSocket-based real-time updates

The main goal of TideMate is to demonstrate how a marketplace-style application can be designed with practical security and clean user experience in mind.

---

## Tech Stack

### Frontend

- **React**
- **Vite**
- **React Router**
- **Tailwind CSS**
- **Axios**
- **Leaflet**
- **WebSockets**

### Backend

- **Django**
- **Django REST Framework**
- **SimpleJWT**
- **Django Channels**
- **SQLite** for local development
- **PostgreSQL** recommended for production
- **Redis** is required when using the production settings.

---

## Core Features

### User and Account Features

- User registration
- Login and logout
- Email verification
- Profile pages
- Public host profiles
- Safer email-change flow
- Device/session handling

### Boat Listing Features

- Host dashboard
- Create, edit, and delete boat listings
- Upload boat images
- Search and filter boat listings
- Map/location support
- Public listing pages

### Booking Features

- Renters can request bookings
- Hosts can manage booking requests
- Booking confirmation and cancellation flow
- Booking status tracking
- Protection against invalid booking actions

### Marketplace Features

- Save favorite boats
- Review boats and users
- Chat between users
- Real-time notifications
- Responsive frontend design

---

## Security Highlights

TideMate includes several security-focused design choices beyond a basic CRUD application.

### Authentication and Sessions

- Uses **HttpOnly JWT cookies** instead of storing access tokens in `localStorage`
- Uses **CSRF protection** for unsafe cookie-authenticated requests
- Uses short-lived access tokens
- Supports refresh token rotation and blacklisting
- Uses generic login errors to avoid leaking account state
- Requires email verification before login
- Tracks user sessions/devices

### Authorization

- Object-level permission checks for:
  - boat listings
  - bookings
  - conversations
  - chat messages
  - favorites
  - reviews
  - notifications
- Hosts can only manage their own listings
- Renters and hosts can only access bookings they are part of
- Chat conversations are restricted to participants
- Private user data is not exposed through public profile endpoints

### Upload and Input Validation

- Uploaded images are validated server-side
- Image checks include:
  - file extension
  - MIME/content type
  - file size
  - image format
  - dimensions
  - Pillow verification
- Uploaded images are sanitized/re-encoded
- Important listing values are validated server-side
- User-generated fields have maximum lengths
- Search and text inputs are constrained

### WebSocket Security

- WebSockets require authentication
- WebSocket origins are validated
- Chat and notification sockets check user access
- Expired sessions are handled
- Chat actions are rate-limited

### Production Security Settings

The production settings include support for:

- secure cookies
- HSTS
- SSL redirect
- allowed hosts
- trusted CSRF origins
- stricter deployment checks
- safer production defaults

---

## Project Structure

```text
TideMate/
├── backend/       # Django REST API, authentication, bookings, chat, notifications
├── frontend/      # React/Vite frontend
├── docs/          # Screenshots and documentation assets
└── README.md      # Project documentation
```

---

## Screenshots

> The paths below assume the screenshots exist in `docs/screenshots/`.

### Homepage

<img src="docs/screenshots/homepage.png" alt="TideMate homepage" width="900">

### My Bookings

<img src="docs/screenshots/my-bookings.png" alt="TideMate my bookings page" width="900">

### Host Bookings

<img src="docs/screenshots/host-bookings.png" alt="TideMate host bookings page" width="900">

---

## Local Development Setup

TideMate is configured for local development with a Vite dev proxy.

The frontend can call:

```text
/api/...
```

and Vite forwards those requests to Django at:

```text
http://localhost:8000
```

This avoids common local CSRF/cookie issues caused by mixing `localhost` and `127.0.0.1`.

Recommended local URLs:

```text
Backend:  http://localhost:8000
Frontend: http://localhost:5173
```

Avoid mixing these with `127.0.0.1` unless the backend CORS, CSRF, cookie, and frontend environment settings are updated consistently.

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

If the frontend runs on Vite at `localhost:5173` and the backend runs at `localhost:8000`, the Vite config should proxy WebSocket traffic as well as API traffic.

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

If the frontend and backend are deployed on different domains, the frontend WebSocket base URL must be configured explicitly. CORS, CSRF trusted origins, allowed hosts, and WebSocket origins must match the deployed domains.

---

## Running Tests

From the backend folder:

```bash
python manage.py test
```

To test the main app areas:

```bash
python manage.py test bookings reviews users listings chat notifications favorites
```

Recommended backend checks before submission:

```bash
python manage.py check
python manage.py test
python manage.py check --deploy --settings=config.settings.prod
```

Frontend checks:

```bash
cd frontend
npm install
npm run lint
npm run build
```

Optional dependency/security checks:

```bash
pip-audit
npm audit
```

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

Recommended local cleanup before committing:

```bash
find . -type d -name "__pycache__" -prune -exec rm -rf {} +
find . -type d -name ".pytest_cache" -prune -exec rm -rf {} +
find . -name ".DS_Store" -delete
```

---

## Important Backend Apps

```text
bookings/       Booking creation, confirmation, cancellation, and booking rules
chat/           Conversations, messages, and WebSocket consumers
favorites/      Favorite boat listings
listings/       Boat listings, images, search, filters, and listing conditions
notifications/  Notification creation and delivery
reviews/        Boat and user reviews
users/          Authentication, email verification, profiles, and device sessions
```

---

## Local Development Notes

- Keep Django on `http://localhost:8000`.
- Keep Vite on `http://localhost:5173`.
- Avoid mixing `localhost` and `127.0.0.1`.
- The frontend usually does not need `VITE_API_BASE_URL` locally.
- The frontend can call `/api/...` and rely on the Vite proxy.
- If `VITE_API_BASE_URL` is overridden locally, use:

```text
http://localhost:8000/api
```

This keeps cookies, CSRF, and local requests predictable.

---

## Production Checklist

TideMate is not yet production-ready. Before deploying publicly, the following should be completed.

### Required Production Configuration

- Use PostgreSQL instead of SQLite
- Set `DEBUG=False`
- Use a strong production `SECRET_KEY`
- Configure `ALLOWED_HOSTS`
- Configure CORS allowed origins
- Configure CSRF trusted origins
- Use HTTPS only
- Enable secure cookies
- Enable HSTS only after HTTPS is confirmed working
- Use Redis for Django Channels
- Use Redis or another shared cache for throttling
- Configure a real email backend
- Store secrets in environment variables
- Restrict and monitor Django admin access

### Media and Upload Hardening

- Store uploaded files outside the source tree
- Use safe production media storage, such as:
  - S3
  - Cloudflare R2
  - Azure Blob Storage
  - Google Cloud Storage
- Ensure uploaded files cannot execute as code
- Apply upload limits at the reverse proxy level
- Serve media through a dedicated media layer or CDN

### Frontend and Deployment Security

- Add a strict Content Security Policy
- Avoid `unsafe-inline` where possible
- Configure correct frontend environment variables
- Ensure WebSocket URLs use `wss://` in production
- Confirm CORS, CSRF, cookies, and WebSocket origins all match the deployed domains

### Monitoring and Abuse Prevention

- Monitor failed login attempts
- Monitor password resets
- Monitor email changes
- Monitor suspicious uploads
- Monitor booking creation and cancellation activity
- Add moderation tools for listings, reviews, and chat
- Add audit logging for sensitive actions

---

## Known Limitations

The project is functional, but the following areas should be improved before it is treated as a real marketplace:

- Payment handling is not implemented
- Deposit and refund logic is not implemented
- Host/renter verification is not implemented
- Insurance/legal workflows are not implemented
- Production-grade media storage is not yet configured
- Some frontend areas need stronger automated test coverage
- Moderation and abuse-reporting tools should be expanded
- Third-party geocoding/location lookups should eventually be routed through the backend
- Production monitoring and alerting are not yet configured

---

### Future production hardening

The booking service already uses transactions and row locks to prevent overlapping confirmed bookings at the application level. For a real production marketplace running on PostgreSQL, this could be strengthened further with a partial GiST exclusion constraint that prevents two confirmed bookings for the same boat from having overlapping date ranges.

Conceptually:

- same `boat_id`
- overlapping `[start_date, end_date)` date range
- only where `status = "confirmed"`

This would protect the database even if future code accidentally bypassed the booking service layer.

---

## What This Project Demonstrates

TideMate demonstrates practical experience with:

- Full-stack web development
- REST API design
- Django backend architecture
- React frontend architecture
- Authentication and authorization
- Secure cookie-based JWT sessions
- CSRF-aware frontend/backend communication
- Email verification and account-management flows
- File upload validation and image sanitization
- Relational data modeling
- Object-level permissions
- Real-time communication with WebSockets
- Frontend routing and API integration
- Marketplace-style booking workflows
- Security-conscious design for a private/full-stack web application

---

## Current Status

TideMate is a functional full-stack marketplace prototype with a strong focus on backend architecture, authentication, authorization, validation, image upload safety, and user-facing marketplace features.

It is suitable as a student/portfolio project and can be improved further with more frontend tests, stronger production deployment hardening, and real marketplace infrastructure such as payments, verification, and moderation.

