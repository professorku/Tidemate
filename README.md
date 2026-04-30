# TideMate

TideMate is a full-stack Boatbnb-style marketplace where users can list boats, book rentals, save favorites, write reviews, chat in real time, and receive notifications.

> **Project status:** TideMate is under active development and was built as a student/portfolio project. The app is functional and includes several security-focused design choices, but it should still be considered a prototype until the production checklist in this README has been completed.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Security Features](#security-features)
- [Screenshots](#screenshots)
- [Clean Local Setup](#clean-local-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [WebSocket Setup](#websocket-setup)
- [Running Tests](#running-tests)
- [Important Backend Apps](#important-backend-apps)
- [Environment Files](#environment-files)
- [Production Notes](#production-notes)
- [Known Limitations and Future Hardening](#known-limitations-and-future-hardening)
- [Current Status](#current-status)

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Leaflet
- WebSockets

### Backend

- Django
- Django REST Framework
- SimpleJWT
- Django Channels
- WebSockets
- SQLite for local development
- PostgreSQL recommended for production
- Redis recommended for production Channels/throttling/cache support

## Project Structure

```text
TideMate/
├── backend/      # Django REST API, authentication, bookings, chat, notifications
├── frontend/     # React/Vite frontend
└── docs/         # Screenshots and documentation assets
```

## Core Features

- User registration, login, logout, and email verification
- Secure JWT authentication using httpOnly cookies
- Host dashboard for creating and managing boat listings
- Boat image upload with server-side validation and sanitization
- Public boat browsing with search and filtering
- Public user profiles with host-specific listings
- Booking flow for renters
- Booking management for hosts
- Favorites system
- Reviews for boats and users
- Real-time chat using Django Channels and WebSockets
- Real-time notifications
- Location picker and map-based listing information
- Responsive React frontend

## Security Features

TideMate includes several security-focused improvements beyond a basic CRUD application:

- httpOnly JWT cookies instead of storing tokens in `localStorage`
- CSRF protection for unsafe cookie-authenticated requests
- Short-lived access tokens with refresh token rotation and blacklisting
- Email verification before login
- Safer email-change flow with password confirmation and verification of the new email address
- Generic login errors to avoid leaking whether inactive accounts exist
- Case-insensitive email uniqueness enforced at the database level
- Object-level permissions for bookings, conversations, favorites, reviews, listings, and notifications
- Server-side validation for uploaded images, including MIME type, extension, size, format, dimensions, and Pillow verification
- Image sanitization/re-encoding to reduce the risk of malicious or malformed uploads
- Listing value validation for price, guest capacity, coordinates, title length, and location length
- Database check constraints for important listing values
- Maximum lengths for user-generated text fields such as reviews, bios, cancellation reasons, and search queries
- WebSocket authentication and session-expiry handling
- WebSocket origin validation
- Chat and notification access checks based on the authenticated user
- Booking creation and confirmation wrapped in database transactions to reduce double-booking risk
- Throttling configuration for authentication and sensitive API endpoints
- Production settings for secure cookies, HSTS, SSL redirect, trusted origins, and related deployment controls

## Screenshots

### Homepage

<img src="docs/screenshots/homepage.png" alt="TideMate homepage" width="900">

### My Bookings

<img src="docs/screenshots/my-bookings.png" alt="TideMate my bookings page" width="900">

### Host Bookings

<img src="docs/screenshots/host-bookings.png" alt="TideMate host bookings page" width="900">

## Clean Local Setup

This project is configured for local development with a Vite dev proxy. The browser calls `/api/...` on the frontend origin, and Vite forwards those requests to Django at `http://localhost:8000`.

This avoids common local CSRF problems caused by mixing `localhost` and `127.0.0.1`.

Recommended local URLs:

```text
Backend:  http://localhost:8000
Frontend: http://localhost:5173
```

Avoid mixing these with `127.0.0.1` unless you update the CORS, CSRF, cookie, and frontend environment settings consistently.

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

## WebSocket Setup

TideMate uses WebSockets for chat and real-time notifications.

In local development, the frontend should connect to the Django ASGI server for `/ws/...` routes. If the frontend runs on Vite at `localhost:5173` and the backend runs at `localhost:8000`, the Vite config should proxy WebSocket traffic as well as API traffic.

Example Vite proxy entry:

```js
'/ws': {
  target: 'ws://localhost:8000',
  ws: true,
  changeOrigin: true,
},
```

For production, route WebSocket traffic to the Django ASGI server, for example:

```text
/api/* -> Django backend
/ws/*  -> Django ASGI server
/media/* -> production media storage or media-serving layer
```

If the frontend and backend are deployed on different domains, configure the frontend WebSocket base URL explicitly and make sure CORS, CSRF, allowed hosts, and trusted origins match the deployed domains.

## Local Development Notes

- Keep Django on `http://localhost:8000`, not `http://127.0.0.1:8000`.
- The frontend defaults to `/api`, which uses the Vite proxy in development.
- You normally do not need to set `VITE_API_BASE_URL` locally.
- If you override `VITE_API_BASE_URL`, use:

```text
http://localhost:8000/api
```

This keeps CSRF cookies and requests on compatible hosts.

## Running Tests

From the backend folder:

```bash
python manage.py test
```

To test the main app areas:

```bash
python manage.py test bookings reviews users listings chat notifications favorites
```

Recommended checks before submission or deployment:

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

Security/dependency checks can also be useful:

```bash
pip-audit
npm audit
```

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

Do not commit real secrets.

Before sharing or submitting the project, check that private files are not included:

```bash
find . -name ".env" -o -name "*.pem" -o -name "*.key" -o -name "db.sqlite3" -o -name ".DS_Store" -o -name "__MACOSX"
```

## Production Notes

Before deploying TideMate publicly, configure the production environment carefully:

- Use PostgreSQL instead of SQLite.
- Set `DEBUG=False`.
- Use a strong production `SECRET_KEY`.
- Configure `ALLOWED_HOSTS`.
- Configure CORS and CSRF trusted origins.
- Use HTTPS only.
- Enable secure cookies.
- Enable HSTS only after HTTPS is confirmed to work correctly.
- Use Redis for Django Channels.
- Use Redis or another shared cache backend for throttling.
- Configure a real email backend for verification, password reset, and account-security emails.
- Store secrets in environment variables, not in source code.
- Serve uploaded media files through a safe production media storage setup such as S3, Cloudflare R2, Azure Blob Storage, Google Cloud Storage, or another dedicated media layer.
- Ensure uploaded files cannot be executed as code by the web server.
- Add a strict Content Security Policy at the frontend host or reverse proxy.
- Monitor failed login attempts, password reset activity, email changes, booking actions, and suspicious upload failures.
- Restrict and monitor Django admin access.

## Known Limitations and Future Hardening

TideMate is functional, but the following areas should be improved before treating it as a real production marketplace:

- Add a production-grade media storage solution for uploaded boat and profile images.
- Move third-party geocoding/location lookups behind the backend to improve privacy, caching, throttling, and provider control.
- Tighten the production Content Security Policy and avoid `unsafe-inline` where possible.
- Add a dedicated audit log for sensitive actions such as login attempts, password resets, email changes, booking creation, booking confirmation, listing updates, and admin actions.
- Add stronger moderation tools for reports, blocked users, suspicious listings, abusive reviews, and chat abuse.
- Add payment handling, cancellation/refund logic, payout logic, and fraud controls before real rentals are accepted.
- Add host/renter verification if the app is used outside a demo environment.
- Add more automated tests for object-level permissions, CSRF failures, image upload rejection, booking overlap, and WebSocket access control.
- Verify that all frontend pages compile cleanly with `npm run build` before submission.

## Current Status

TideMate is a functional full-stack marketplace prototype with a strong focus on practical backend architecture, authentication, validation, authorization, and user-facing marketplace features.

The project is suitable as a student/portfolio project and demonstrates work with:

- Full-stack web development
- REST API design
- Authentication and authorization
- Secure cookie-based JWT sessions
- CSRF-aware frontend/backend communication
- Email verification and safer account-management flows
- File upload validation and image sanitization
- Relational data modeling
- Real-time features with WebSockets
- Frontend state and API integration
- Marketplace-style booking workflows
- Security-conscious design for a private/full-stack web application
