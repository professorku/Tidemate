# TideMate

TideMate is a full-stack Boatbnb-style marketplace where users can list boats, book rentals, save favorites, write reviews, chat in real time, and receive notifications.

> **Note:** TideMate is under active development and was built as a student/portfolio project. The project is functional, but some areas are still being improved and hardened.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Leaflet

### Backend

- Django
- Django REST Framework
- SimpleJWT
- Django Channels
- WebSockets
- SQLite for local development
- PostgreSQL recommended for production

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
- Boat image upload with server-side validation
- Public boat browsing with search and filtering
- Public user profiles with host-specific listings
- Booking flow for renters
- Booking management for hosts
- Favorites system
- Reviews for boats and users
- Real-time chat using Django Channels and WebSockets
- Real-time notifications
- Responsive React frontend

## Security Features

TideMate includes several security-focused improvements beyond a basic CRUD application:

- httpOnly JWT cookies instead of storing tokens in localStorage
- CSRF protection for unsafe cookie-authenticated requests
- Short-lived access tokens with refresh token rotation and blacklisting
- Email verification before login
- Generic login errors to avoid leaking whether inactive accounts exist
- Case-insensitive email uniqueness enforced at the database level
- Object-level permissions for bookings, conversations, favorites, reviews, and notifications
- Server-side validation for uploaded images, including MIME type, size, format, dimensions, and Pillow verification
- Listing value validation for price, guest capacity, coordinates, title length, and location length
- Database check constraints for important listing values
- Maximum lengths for user-generated text fields such as reviews, bios, cancellation reasons, and search queries
- WebSocket authentication and session-expiry handling
- Throttling configuration for authentication and sensitive API endpoints
- Production settings for secure cookies, HSTS, SSL redirect, and trusted origins

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
python manage.py test bookings reviews users listings
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

## Production Notes

Before deploying TideMate publicly, configure the production environment carefully:

- Use PostgreSQL instead of SQLite.
- Set `DEBUG=False`.
- Use a strong production `SECRET_KEY`.
- Configure `ALLOWED_HOSTS`.
- Configure CORS and CSRF trusted origins.
- Use HTTPS only.
- Enable secure cookies.
- Use Redis for Django Channels.
- Use Redis or another shared cache backend for throttling.
- Configure a proper email backend.
- Store secrets in environment variables, not in source code.
- Serve media files through a safe production media storage setup.
- Consider adding a Content Security Policy at the frontend host or reverse proxy.

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

## Current Status

TideMate is a functional full-stack marketplace prototype with a strong focus on practical backend architecture, authentication, validation, and user-facing marketplace features.

The project is suitable as a student/portfolio project and demonstrates work with:

- Full-stack web development
- REST API design
- Authentication and authorization
- Secure cookie-based JWT sessions
- CSRF-aware frontend/backend communication
- File upload validation
- Relational data modeling
- Real-time features with WebSockets
- Frontend state and API integration
- Marketplace-style booking workflows
