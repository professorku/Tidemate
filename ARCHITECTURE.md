# TideMate architecture notes

This document describes how TideMate is organized and the rules to follow when adding or changing code.

TideMate is a full-stack boat rental marketplace built with a React/Vite frontend and a Django REST Framework backend. The project also uses Django Channels for realtime features, HttpOnly JWT cookies for authentication, CSRF protection for cookie-authenticated write requests, user-uploaded media, Stripe payments, reporting/moderation, and Docker-based deployment.

The main architectural goal is simple: keep UI code in the frontend, keep business rules and security decisions in the backend, and keep each domain in a predictable place.

## Repository layout

```text
Tidemate-main/
├── frontend/              # React/Vite single-page app
├── backend/               # Django REST/Channels backend
├── compose.prod.yml       # Production Docker Compose stack
├── deployment/nginx/      # Host/reverse-proxy nginx examples
├── README.md              # Project overview and setup
└── ARCHITECTURE.md        # This document
```

The frontend owns presentation, routing, user interaction, client-side state, and API consumption.

The backend owns authentication, authorization, validation, persistence, business rules, payments, file processing, audit logging, and realtime access checks.

## Runtime architecture

Production is designed around Docker Compose:

```text
Browser
  ↓
Frontend nginx container
  ├── serves the React build
  ├── serves /media/ and /static/ from shared volumes
  ├── proxies /api/ to the backend
  └── proxies /ws/ to the backend
        ↓
Django/Daphne backend
  ├── DRF HTTP APIs
  ├── Channels WebSockets
  ├── cookie JWT authentication
  ├── CSRF-protected writes
  └── domain business logic
        ↓
PostGIS/PostgreSQL + Redis
```

Production services:

- `postgres`: PostGIS-enabled PostgreSQL database.
- `redis`: cache, Channels layer, throttling/session-related support.
- `backend`: Django app served by Daphne.
- `maintenance`: scheduled backend maintenance tasks.
- `frontend`: nginx serving React and proxying API/WebSocket traffic.

## Frontend structure

The frontend is feature-based.

```text
frontend/src/
├── api/
│   ├── client.js          # shared API client
│   └── domains/           # domain API modules
├── components/            # shared domain components
├── components/ui/         # generic reusable UI components
├── context/               # app-wide auth, toast, notification state
├── features/              # feature folders
├── hooks/                 # reusable cross-feature hooks
├── lib/                   # shared infrastructure helpers
├── query/                 # React Query client and query keys
├── routes/                # lazy route loading
├── types/                 # shared domain type helpers/docs
└── utils/                 # shared pure utility functions
```

Current API domain modules:

```text
frontend/src/api/domains/
├── bookings.js
├── chat.js
├── favorites.js
├── geocoding.js
├── listings.js
├── moderation.js
├── payments.js
├── reports.js
├── reviews.js
└── users.js
```

Current feature areas include auth, home/search, boat detail, add boat, edit boat, my boats, bookings, host bookings, messages, notifications, profile, public profile, favorites, reviews, reports, payments, moderation, navigation, location picker, availability calendar, and the about/project page.

### Frontend routing

Routes are defined in `frontend/src/App.jsx` and lazy-loaded from `frontend/src/routes/lazyPages.js`.

Public routes include:

```text
/
/about
/boats/:id
/users/:id
/login
/signup
/forgot-password
/reset-password
/verify-email
/verify-email-change
```

Authenticated routes are wrapped with `ProtectedRoute`, including:

```text
/favorites
/add-boat
/my-boats
/my-boats/:id/edit
/my-bookings
/bookings/:id
/messages
/messages/:id
/host-bookings
/notifications
/profile
/profile/edit
/change-password
/payments/success
/payments/cancelled
```

Admin-only routes are wrapped with `AdminRoute`:

```text
/moderation
```

`ProtectedRoute` and `AdminRoute` improve the user experience, but the backend must still enforce all real permissions.

### Frontend rules

When adding frontend code:

- Put feature-specific code in `src/features/<feature-name>/`.
- Put generic reusable UI in `src/components/ui/`.
- Put shared domain components in `src/components/`.
- Put cross-feature hooks in `src/hooks/`.
- Put API calls in `src/api/domains/` unless a feature-specific wrapper is clearly needed.
- Keep page files thin. Pages should compose components and hooks, not contain large business rules.
- Use the shared API client so credentials, CSRF, and retry behavior stay centralized.
- Use React Query for server state.
- Use context only for app-wide state such as auth/session, toasts, and notifications.
- Do not store access or refresh tokens in `localStorage`.
- Prefer query invalidation and context refresh methods over `window.dispatchEvent(...)`.

## Backend structure

The backend follows a domain-app layout.

```text
backend/
├── users/                 # auth, profiles, relationships, sessions
├── listings/              # boat listings, images, location privacy
├── bookings/              # booking lifecycle and availability rules
├── payments/              # Stripe checkout and payment state
├── chat/                  # conversations, messages, chat WebSockets
├── notifications/         # notifications and notification WebSockets
├── favorites/             # saved listings
├── reviews/               # reviews and review permissions
├── reports/               # user-submitted reports
├── moderation/            # admin moderation APIs
├── geocoding/             # location search/reverse geocoding
├── audit/                 # audit events and request monitoring
└── config/                # settings, URLs, ASGI/WSGI, auth, security config
```

### Backend file conventions

Use these boundaries where possible:

- `views.py`: HTTP entry points and request orchestration.
- `serializers.py`: validation and API representation.
- `read_serializers.py`: read/list/detail response serializers.
- `write_serializers.py`: create/update serializers.
- `selectors.py`: reusable read/query logic.
- `services.py`: writes, transactions, and business rules.
- `permissions.py`: role, ownership, and object-level permission checks.
- `models.py`: database models and constraints.
- `urls.py`: app-level routing.
- `tests/`: app-specific tests.

Focused helper modules such as `creation.py`, `expiry.py`, `lifecycle.py`, `serializer_helpers.py`, `queryset_utils.py`, or `write_mixins.py` are fine when they keep large domain files smaller.

### Backend rules

When adding backend code:

- Keep object-level permission checks explicit.
- Never trust frontend-provided ownership fields.
- Use serializers for input validation and normalization.
- Use services for writes involving business rules, side effects, or multiple models.
- Use selectors for repeated read/query patterns.
- Keep views small and predictable.
- Use `select_related` and `prefetch_related` when returning related data.
- Add database constraints when the rule must be true outside normal request flow.
- Cover security-sensitive behavior with tests.

## Authentication and sessions

HTTP authentication uses JWTs stored in HttpOnly cookies. The frontend does not store raw JWTs in JavaScript-readable storage.

Important rules:

- Access and refresh tokens stay in HttpOnly cookies.
- Unsafe requests such as `POST`, `PUT`, `PATCH`, and `DELETE` must pass CSRF checks.
- Token refresh, CSRF handling, and credentials should stay centralized in the frontend API client.
- Logout should clear cookies and revoke the relevant session where possible.
- Password reset/password change flows should revoke active sessions where appropriate.
- Frontend session state may show whether the user appears logged in, but the backend remains the source of truth.

The backend authentication layer is centered around `config.authentication.CookieJWTAuthentication` and SimpleJWT settings in `config/settings/base.py`.

## WebSockets and realtime behavior

Realtime features use Django Channels.

Current WebSocket areas:

- chat conversations
- user notifications
- auth/session disconnect events

The ASGI entry point is `backend/config/asgi.py`. WebSocket authentication is handled by `config.jwt_websocket_middleware.JWTAuthMiddleware`, which reads JWT cookies and attaches the authenticated user to the socket scope.

WebSocket rules:

- Reject unauthenticated connections.
- Validate that a user can access a conversation before joining its group.
- Scope notification sockets to the authenticated user.
- Disconnect sockets when token expiry is reached.
- Support forced disconnect for revoked sessions.
- Reject oversized payloads before JSON parsing.
- Do not accept binary chat payloads.
- Rate-limit chat message sending.

Payload size limits are centralized in:

```text
backend/config/websocket_limits.py
```

## Listings and location privacy

Listings separate public location information from private pickup information.

Public listing text should expose a general area, such as a city or region. Exact pickup details belong in private pickup fields and should only be shown to authorized users when appropriate.

Rules:

- Do not expose exact pickup addresses in public listing text.
- Do not expose exact coordinates publicly unless the view is intentionally private/authorized.
- Keep public area/search display separate from private pickup instructions.
- The backend owns privacy validation; frontend warnings are only guidance.
- Privacy validation should avoid false positives that block normal boat names, model names, years, or jokes unless they clearly reveal private pickup details.

## Media uploads and image optimization

User-uploaded media is processed by the backend. Shared upload logic lives in:

```text
backend/config/uploads.py
```

The upload pipeline:

```text
User uploads JPG / PNG / WEBP / GIF
        ↓
Backend validates content type and real image bytes
        ↓
Backend rejects corrupted, unsafe, oversized, or decompression-bomb images
        ↓
Backend applies EXIF orientation safely
        ↓
Backend strips metadata, including possible GPS/camera metadata
        ↓
Backend resizes large images to a safe web size
        ↓
Backend stores an optimized WebP image
        ↓
For listing images, backend also creates a smaller WebP thumbnail
```

Current stored file patterns:

```text
*_optimized.webp
*_optimized_thumb.webp
```

Current size strategy:

- main optimized image: max 1600x1600
- thumbnail/card image: max 640x640

A future larger deployment can move uploaded media from local Docker volumes to object storage/CDN. The database should continue to store paths/URLs, not image bytes.

## Bookings and payments

Bookings are managed by the backend as a lifecycle, not as frontend-only state.

Important booking modules include:

```text
backend/bookings/creation.py
backend/bookings/confirmation.py
backend/bookings/expiry.py
backend/bookings/lifecycle.py
backend/bookings/services.py
backend/bookings/selectors.py
```

Payment logic lives in the `payments` app and integrates with Stripe Checkout.

Rules:

- The backend owns booking status transitions.
- The backend owns payment creation and validation.
- Users can only pay for bookings they are allowed to access.
- Hosts and renters should see only bookings/payments scoped to them, unless the user is staff.
- Payment success/cancel frontend pages should reflect backend payment state instead of trusting URL parameters alone.
- Expired awaiting-payment bookings should be handled server-side.

## Reports, moderation, and audit logging

Reports and moderation are separate domains:

- `reports/`: normal authenticated users submit reports.
- `moderation/`: staff/admin users review and update reports.

Reports can target listings, users, reviews, and chat messages. The report model enforces that each report points to exactly one matching target type and prevents duplicate reports from the same reporter against the same target.

Moderation endpoints must stay staff-only through backend permissions. Frontend admin routing is not a security boundary.

Audit logging lives in `audit/` and is used for security-sensitive actions such as moderation updates and request monitoring.

Rules:

- Admin-only behavior must be enforced by backend permissions.
- Moderation updates should be audit logged.
- Security logs should avoid leaking tokens, passwords, or sensitive user data.
- Request monitoring should stay useful without logging unnecessary private content.

## API and state management

Frontend API access should go through the shared API client and domain API modules.

Rules:

- Keep base URL handling centralized.
- Keep cookie/credential behavior centralized.
- Keep CSRF handling centralized.
- Avoid duplicated refresh/retry logic in feature components.
- Use React Query for server state.
- Use local component state for temporary UI state.
- Use context for app-wide concerns only.

Backend APIs should keep read and write behavior clear:

- Use selectors for read/query logic.
- Use services for writes and domain operations.
- Use serializers to validate input and shape output.
- Keep public endpoints intentionally public and rate-limited.
- Keep private endpoints scoped by authenticated user and object permissions.

## Security principles

TideMate should keep these security principles:

- Default to server-side authorization.
- Never rely only on hidden frontend UI for access control.
- Keep JWTs out of JavaScript-readable storage.
- Use CSRF protection for cookie-authenticated write requests.
- Validate and sanitize uploaded files.
- Treat uploaded media as user-controlled content even after sanitizing.
- Scope user data by authenticated user, role, and object ownership.
- Use object-level permissions for listings, bookings, chats, reviews, favorites, reports, payments, and notifications.
- Keep throttling on sensitive endpoints.
- Keep production security headers active.
- Keep dependency, secret, and static-analysis checks in CI.

## Deployment notes

Production should keep the active nginx path aligned with the app security model.

Important production areas:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- secure cookie settings
- HSTS when served over HTTPS
- `/api/` proxying to backend
- `/ws/` proxying with upgrade headers
- safe serving of `/media/` and `/static/`

The frontend Docker nginx config and any host-level nginx config should not drift apart. If one path adds allowed image/script/connect sources, the active production path must be updated too.

Frontend-only rebuild:

```bash
docker compose --env-file .env.production -f compose.prod.yml up -d --no-deps --build frontend
```

Backend-only rebuild:

```bash
docker compose --env-file .env.production -f compose.prod.yml up -d --no-deps --build backend
```

## Testing and CI

Tests should stay close to the domain they verify.

Backend tests should cover:

- authentication, CSRF, and session behavior
- object-level permissions
- listing creation/update/delete rules
- location privacy rules
- image validation, optimization, and thumbnail generation
- booking lifecycle rules
- payment state rules
- chat participation rules
- notification scoping
- review/favorite ownership rules
- reports and moderation permissions

Frontend tests should cover:

- important route flows
- auth/session behavior
- listing/search display behavior
- add/edit boat flows
- booking flows
- messages/notifications behavior where practical
- admin-only moderation UI behavior

Current CI/security checks include:

- backend system checks
- migration check
- backend tests
- production deploy check
- frontend lint
- frontend tests
- frontend build
- Playwright E2E smoke test
- secret scanning
- Python dependency audit
- frontend dependency audit
- Bandit
- Semgrep
- CodeQL

## Current architecture priorities

Highest-priority maintenance rules:

1. Keep auth, cookies, CSRF, and refresh behavior centralized.
2. Keep object-level permissions explicit and tested.
3. Keep public listing location separate from private pickup details.
4. Keep upload validation, metadata stripping, WebP optimization, and thumbnail generation in the backend.
5. Keep booking/payment status transitions server-owned.
6. Keep frontend API calls behind shared domain modules.
7. Keep feature-only frontend code inside feature folders.
8. Keep admin/moderation permissions enforced in the backend.
9. Keep WebSocket auth and disconnect behavior aligned with normal session behavior.
10. Keep production nginx/CSP config aligned with the actual deployment path.

## Summary

TideMate uses a domain-based Django backend and a feature-based React frontend. The backend owns security, validation, authorization, uploads, payments, audit logging, and business rules. The frontend owns presentation, routing, user interaction, and API consumption.

The main architectural direction is to keep the project modular, predictable, and production-minded without spreading business rules across unrelated files.
