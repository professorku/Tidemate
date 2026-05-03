# Tidemate architecture notes

This document describes how the Tidemate codebase is organized and the rules that should be followed when adding or changing code.

Tidemate keeps the existing UX and core product logic, but standardizes where frontend and backend code should live so the repository stays easier to maintain, test, and deploy.

## High-level architecture

Tidemate is a full-stack boat rental marketplace with:

- a React/Vite frontend
- a Django REST Framework backend
- JWT authentication stored in HttpOnly cookies
- CSRF protection for cookie-authenticated write requests
- WebSocket-based realtime features
- user-uploaded media for boat listings and profile images
- Docker-based local/production deployment support

The project is organized as two main applications:

```text
frontend/
backend/
```

The frontend owns presentation, routing, client-side state, and API calls.

The backend owns authentication, authorization, validation, persistence, business rules, file processing, and realtime access checks.

## Frontend structure

Use these rules going forward:

- `src/api/`
  - low-level API client and domain API modules
  - no page logic here
  - API modules should expose clear functions such as `getListings`, `createBooking`, or `updateProfile`
- `src/components/ui/`
  - fully shared presentational building blocks
  - components here should not know about a specific feature/domain
- `src/components/`
  - shared domain-level components used across multiple features
  - examples: boat cards, image galleries, shared layout pieces
- `src/context/`
  - app-wide session, toast, and notification state
  - keep long-lived global state here only when it is truly shared across the app
- `src/hooks/`
  - cross-feature reusable hooks
  - avoid placing feature-only hooks here
- `src/features/<feature-name>/`
  - page-specific components, hooks, and helpers for a single feature
  - use this as the default location for new feature work
- `src/pages/`
  - route-level pages that compose feature components
  - keep heavy business logic out of page files
- `src/utils/`
  - shared formatting, image helpers, date helpers, and small pure utility functions

## Frontend guardrails

Before creating a new file:

- Put it in a feature folder if it is only used by one feature.
- Put it in `components/ui` only if it is generic and reusable.
- Put it in `components/` if it is a reusable domain component shared by multiple features.
- Import API functions from `src/api/domains/*` when no feature-specific wrapper logic is needed.
- Prefer React Query invalidation and context methods over `window.dispatchEvent(...)`.
- Keep page files thin. Pages should compose components, not contain large amounts of business logic.
- Do not store access tokens or refresh tokens in `localStorage`.
- Keep tokens server-controlled through HttpOnly cookies.
- Use a small helper for repeated image URL selection if multiple image sizes are introduced later.

## Backend structure

The backend follows a domain-app layout:

- `users/`
- `listings/`
- `bookings/`
- `chat/`
- `notifications/`
- `favorites/`
- `reviews/`
- `audit/`
- `geocoding/`
- `config/`

Inside each app, keep these boundaries:

- `views.py`
  - HTTP entry points
  - request orchestration only
  - avoid large business rules here
- `serializers.py`
  - request/response validation
  - input normalization
  - representation of API responses
- `selectors.py`
  - read/query logic
  - reusable querysets
  - permission-aware data retrieval where appropriate
- `services.py`
  - write/business logic
  - transactional operations
  - domain rules that should not live directly in views
- `permissions.py`
  - object-level access checks
  - role/ownership checks
- `tests/`
  - app-specific unit, integration, and security tests

## Backend guardrails

When adding backend logic:

- Keep object-level permission checks explicit.
- Do not trust frontend-provided ownership fields.
- Use serializers for input validation.
- Use services for writes that involve business rules or multiple models.
- Use selectors for repeated read/query patterns.
- Keep views small and predictable.
- Prefer `select_related` and `prefetch_related` for endpoints that return nested or repeated related data.
- Keep security-sensitive behavior covered by tests.

## Authentication and sessions

HTTP authentication uses JWT cookies with CSRF enforcement for cookie-authenticated writes.

Important rules:

- Access and refresh tokens should stay in HttpOnly cookies.
- Unsafe requests such as `POST`, `PUT`, `PATCH`, and `DELETE` must be protected by CSRF checks.
- Logout should clear cookies and revoke the relevant session where possible.
- Password reset and password change flows should revoke active sessions where appropriate.
- Frontend session state should represent whether the user appears logged in, but it should not contain raw tokens.

The frontend may store a small session hint, but the backend remains the source of truth for authentication.

## Realtime and WebSocket auth

WebSocket auth must stay aligned with normal session and JWT behavior.

Rules:

- WebSocket connections must authenticate the user.
- Unauthenticated connections should be rejected.
- Users should only join groups they are allowed to access.
- Chat messages should be checked against conversation participation.
- Notifications should be scoped to the authenticated user.
- Revoked/expired sessions should not continue receiving realtime data.
- Realtime UI sync should prefer query invalidation and notification context refreshes.

A recommended hardening rule is to reject very large WebSocket payloads before JSON parsing.

Example:

```python
if len(text_data) > 8192:
    await self.close(code=1009)
    return
```

## Media uploads and image optimization

User-uploaded media is handled by the backend, not trusted directly by the frontend.

The upload pipeline should:

- validate the declared content type
- verify that the uploaded bytes are a real image
- reject corrupted or unsafe images
- reject excessive image dimensions and decompression-bomb candidates
- apply EXIF orientation safely
- strip EXIF metadata, including possible GPS/device metadata
- resize very large images to a web-friendly maximum size
- re-encode the stored file instead of saving the original user-supplied bytes

Tidemate now uses the simple optimized image flow:

```text
User uploads JPG / PNG / WEBP / GIF
        ↓
Backend validates the file
        ↓
Backend strips metadata and applies safe orientation
        ↓
Backend resizes huge images to max 1600x1600
        ↓
Backend stores an optimized WebP file
```

The stored image format should be:

```text
*_optimized.webp
```

with content type:

```text
image/webp
```

This keeps storage smaller and improves frontend loading performance while preserving the existing model, serializer, and frontend image URL behavior.

For now, the simple WebP approach does not require database changes because existing `ImageField` fields can store WebP files normally.

A future production-level version may introduce generated variants:

```text
thumb: 320px wide
card: 640px wide
large: 1400px wide
```

If variants are added later, the backend serializer should expose image URLs in a predictable shape, for example:

```json
{
  "image": "/media/boats/gallery/large/example.webp",
  "image_variants": {
    "thumb": "/media/boats/gallery/thumbs/example.webp",
    "card": "/media/boats/gallery/cards/example.webp",
    "large": "/media/boats/gallery/large/example.webp"
  }
}
```

Frontend components should then use a shared helper instead of manually choosing image URLs in every component.

## API and state management

Frontend API access should go through the shared API client and domain API modules.

Rules:

- Keep base URL handling centralized.
- Keep credentials and CSRF handling centralized.
- Avoid duplicating refresh/retry logic across feature files.
- Prefer React Query for server state.
- Prefer local component state for short-lived UI state.
- Prefer context only for app-wide state such as session, toast, and notifications.

## Security principles

Tidemate should keep these security principles:

- Default to server-side authorization.
- Never rely only on hidden frontend UI for access control.
- Keep JWTs out of JavaScript-readable storage.
- Use CSRF protection for cookie-authenticated write requests.
- Validate and sanitize uploaded files.
- Scope user data by authenticated user and role.
- Use object-level permissions for listings, bookings, chats, reviews, favorites, and notifications.
- Keep security headers active in the production nginx configuration.
- Treat uploaded media as user-controlled content even after sanitizing.
- Keep dependency, secret, and static-analysis checks in CI.

## Deployment notes

Production deployment should make sure the active nginx config includes security hardening.

Important headers/config areas:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- secure cookie settings
- HSTS when served over HTTPS
- strict handling of uploaded media responses

The deployment nginx configuration and the frontend Docker nginx configuration should not drift apart. If one contains stronger security headers, the active production path should use those headers too.

For a larger production deployment, uploaded media should eventually move from local disk to object storage such as S3, Azure Blob Storage, Google Cloud Storage, Cloudinary, or similar. The database should continue to store paths/URLs, not image bytes.

## Testing and CI

The project should keep tests close to the domain they verify.

Backend tests should cover:

- authentication and session behavior
- object-level permissions
- listing creation/update/delete rules
- booking rules
- chat participation rules
- notification scoping
- upload validation and WebP optimization
- review/favorite ownership rules

Frontend tests should cover:

- important UI flows
- auth/session behavior
- navigation/search behavior
- listing display behavior
- booking and chat flows where practical

CI/security checks should include:

- backend tests
- frontend tests
- dependency audit
- secret scanning
- static analysis/security linting
- formatting/linting where configured

## Current architecture priorities

Highest-priority maintenance rules:

1. Keep auth and CSRF behavior centralized.
2. Keep object-level permissions explicit and tested.
3. Keep upload validation and WebP optimization in the backend.
4. Keep frontend API calls behind domain API modules.
5. Keep feature-only frontend logic inside feature folders.
6. Keep production nginx security headers aligned with the actual deployment path.
7. Avoid duplicated security configuration where possible.
8. Prefer small, readable services/selectors over large views or components.

## Summary

Tidemate uses a domain-based backend and feature-based frontend. The backend owns security, validation, authorization, uploads, and business rules. The frontend owns presentation, route composition, user interaction, and API consumption.

The main architectural direction is to keep the project modular and predictable while improving production readiness step by step.
