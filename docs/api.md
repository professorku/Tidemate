# Tidemate API Overview

This document gives a practical overview of the main Tidemate backend API endpoints.

Tidemate exposes a Django REST Framework API under `/api/`. Authentication uses JWT access and refresh tokens stored in HttpOnly cookies. Unsafe requests such as `POST`, `PUT`, `PATCH`, and `DELETE` must include a valid CSRF token.

For deeper code organization and deployment details, see `ARCHITECTURE.md`.

## Base URL

Local development:

```text
http://localhost:8000/api/
```

Production:

```text
https://tidemate.macjms.dev/api/
```

The frontend API client defaults to same-origin requests through:

```text
/api
```

`VITE_API_BASE_URL` can override this when the frontend and backend are served from different origins.

## Authentication model

Tidemate uses cookie-based JWT authentication:

- access token: stored in an HttpOnly cookie
- refresh token: stored in an HttpOnly cookie
- CSRF token: exposed through the CSRF cookie and sent as `X-CSRFToken` for unsafe requests
- refresh tokens are rotated and may be blacklisted/revoked
- logout clears cookies and revokes the active session where possible

The browser should not store JWTs in `localStorage` or `sessionStorage`.

## Pagination

Most list endpoints return a paginated response:

```json
{
  "count": 24,
  "next": "...",
  "previous": null,
  "current_page": 1,
  "total_pages": 2,
  "page_size": 12,
  "pagination": {
    "type": "page_number",
    "count": 24,
    "page": 1,
    "total_pages": 2,
    "page_size": 12,
    "has_next": true,
    "has_previous": false,
    "ordering": ["-created_at", "-id"]
  },
  "results": []
}
```

Common query parameters:

| Parameter | Description |
| --- | --- |
| `page` | Page number for page-number pagination |
| `page_size` | Requested page size, capped per endpoint |
| `cursor` | Cursor value for cursor-paginated message lists |

Do not use the old `limit` parameter for listing endpoints. The backend rejects it and expects `page` and `page_size` instead.

## Authentication and users

Base path:

```text
/api/users/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/users/health/` | Health check for database/channel layer status | Public |
| GET | `/api/users/csrf/` | Sets/returns CSRF cookie | Public |
| POST | `/api/users/signup/` | Create inactive account and send verification email | Public + CSRF + Turnstile when enabled |
| POST | `/api/users/login/` | Login and set JWT cookies | Public + CSRF + Turnstile when enabled |
| POST | `/api/users/google-login/` | Login or create account using Google credential | Public + CSRF |
| POST | `/api/users/refresh/` | Rotate/refresh JWT cookies | Refresh cookie + CSRF |
| POST | `/api/users/logout/` | Logout, clear cookies, revoke session where possible | Cookie auth + CSRF |
| POST | `/api/users/forgot-password/` | Request password reset email | Public + CSRF + Turnstile when enabled |
| POST | `/api/users/reset-password/` | Reset password using reset uid/token | Public + CSRF |
| POST | `/api/users/change-password/` | Change password and revoke active sessions | Authenticated + CSRF |
| POST | `/api/users/verify-email/` | Verify newly created account email | Public + CSRF |
| POST | `/api/users/verify-email-change/` | Confirm pending email change | Public token + CSRF |
| POST | `/api/users/resend-verification/` | Resend verification email | Public + CSRF + Turnstile when enabled |
| POST | `/api/users/resend-verification-email/` | Alias for resend verification email | Public + CSRF + Turnstile when enabled |
| GET | `/api/users/me/` | Read authenticated user's profile | Authenticated |
| PATCH | `/api/users/me/` | Update profile, avatar, or request email change | Authenticated + CSRF |
| GET | `/api/users/profiles/<user_id>/` | Public user profile | Public |
| GET | `/api/users/<user_id>/` | Legacy public user profile route | Public |
| POST | `/api/users/crewmates/<user_id>/toggle/` | Toggle crewmate relation | Authenticated + CSRF |
| POST | `/api/users/blocks/<user_id>/toggle/` | Block/unblock another user | Authenticated + CSRF |
| POST | `/api/users/crewmates/<user_id>/` | Legacy crewmate toggle route | Authenticated + CSRF |
| POST | `/api/users/blocks/<user_id>/` | Legacy block toggle route | Authenticated + CSRF |

### Useful user payload fields

`/api/users/me/` includes private account/profile data such as email, pending email change state, profile text, location, avatar URL, and private stats. Public profile routes return only public-facing profile data and public stats.

Profile updates support JSON and multipart form data. Use multipart when uploading `avatar_upload`.

## Listings

Base path:

```text
/api/listings/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/listings/` | List/search public boat listings | Public |
| POST | `/api/listings/` | Create a boat listing | Authenticated + CSRF |
| GET | `/api/listings/<id>/` | Retrieve one public boat listing | Public |
| GET | `/api/listings/mine/` | List authenticated user's own boats | Authenticated |
| GET | `/api/listings/mine/<id>/` | Retrieve one owned listing with owner fields | Owner |
| PUT/PATCH | `/api/listings/mine/<id>/` | Update own boat listing | Owner + CSRF |
| DELETE | `/api/listings/mine/<id>/` | Delete own boat listing | Owner + CSRF |
| GET | `/api/listings/<id>/conditions/` | Get weather/marine conditions for listing | Public |

### Listing search query parameters

| Parameter | Description |
| --- | --- |
| `q` | Search title/location text, max 100 characters |
| `boat_type` | Filter by backend boat type choice |
| `min_guests` | Minimum guest capacity |
| `min_price` | Minimum price per day |
| `max_price` | Maximum price per day |
| `host_id` | Show listings for one host |
| `exclude_id` | Exclude one listing from results |
| `start_date` | Pickup date, `YYYY-MM-DD` |
| `end_date` | Return date, `YYYY-MM-DD` |
| `latitude` | Center latitude for radius search |
| `longitude` | Center longitude for radius search |
| `radius_km` | Radius search distance in kilometers |
| `page` | Page number |
| `page_size` | Page size, capped by the backend |

Availability search uses a half-open date range:

```text
[start_date, end_date)
```

A booking ending on June 10 does not block a new booking starting on June 10.

Radius search requires all three of `latitude`, `longitude`, and `radius_km`. Public radius search uses privacy-safe public coordinates. Staff/admin users may use exact coordinates for search internally.

### Listing location privacy

Public listing responses expose approximate public map coordinates. Exact pickup address, pickup instructions, and exact coordinates are only shown to:

- the listing host
- staff/admin users
- confirmed renters during the configured exact-location disclosure window

Public listing text is validated to reduce accidental leakage of street addresses, dock/slip identifiers, marina details, meeting-point details, and raw coordinates.

Listing creation and update support JSON and multipart form data. Use multipart when uploading images.

## Bookings

Base path:

```text
/api/bookings/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/bookings/` | Create a booking request | Authenticated + CSRF |
| GET | `/api/bookings/my/` | List bookings made by the authenticated renter | Authenticated |
| GET | `/api/bookings/my/counts/` | Count renter bookings by tab/status group | Authenticated |
| GET | `/api/bookings/host/` | List bookings for boats owned by the authenticated host | Authenticated host |
| GET | `/api/bookings/host/counts/` | Count host bookings by tab/status group | Authenticated host |
| GET | `/api/bookings/<booking_id>/` | Retrieve a visible booking | Authenticated participant |
| POST | `/api/bookings/<booking_id>/confirm/` | Confirm a pending booking | Host + CSRF |
| POST | `/api/bookings/<booking_id>/cancel/` | Cancel a booking | Booking participant + CSRF |
| DELETE | `/api/bookings/<booking_id>/delete/` | Archive/delete a visible booking from current user's view | Booking participant + CSRF |

`<booking_id>` may be the public booking id used by the frontend, for example:

```text
TM-ABCDEFGH
```

### Booking request body

Create booking:

```json
{
  "boat": 123,
  "start_date": "2026-06-10",
  "end_date": "2026-06-12"
}
```

Cancel booking:

```json
{
  "reason": "Plans changed."
}
```

### Booking status values

Current booking statuses:

```text
pending
awaiting_payment
confirmed
cancelled
```

Booking creation and confirmation use service-layer validation to prevent invalid dates, self-booking, and overlapping active bookings.

### Booking list filters

Renter bookings support:

```text
timeline=upcoming|active|pending|completed|cancelled
```

Host bookings support:

```text
status=pending|awaiting_payment|confirmed|cancelled
```

The frontend may also use an `all` tab, but it simply omits the query parameter.

## Payments

Base path:

```text
/api/payments/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/payments/bookings/<booking_id>/checkout/` | Create or reuse a Stripe Checkout session for a booking | Authenticated participant + CSRF |
| GET | `/api/payments/bookings/<booking_id>/` | Read payment status for a visible booking | Authenticated participant |
| POST | `/api/payments/stripe/webhook/` | Stripe webhook receiver | Stripe signature |

Checkout response shape:

```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "booking_public_id": "TM-ABCDEFGH",
  "payment": {},
  "reused": false
}
```

Payment statuses:

```text
not_started
checkout_created
paid
failed
refunded
cancelled
```

Stripe webhook events currently handled include checkout completion, checkout expiration, and async payment failure.

## Chat

Base path:

```text
/api/chat/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/chat/conversations/` | List my conversations, including conversation counts | Authenticated |
| GET | `/api/chat/conversations/<conversation_id>/` | Retrieve one visible conversation | Conversation participant |
| POST | `/api/chat/direct/start/` | Start or retrieve a direct conversation | Authenticated + CSRF |
| GET | `/api/chat/conversations/<conversation_id>/messages/` | List messages in a conversation | Conversation participant |
| POST | `/api/chat/conversations/<conversation_id>/messages/` | Send a message | Conversation participant + CSRF |
| DELETE | `/api/chat/conversations/<conversation_id>/delete/` | Hide/delete conversation for current user | Conversation participant + CSRF |
| DELETE | `/api/chat/messages/<message_id>/delete/` | Delete own message | Message author + CSRF |

Start direct conversation:

```json
{
  "user_id": 123,
  "boat_id": 456
}
```

`boat_id` is optional. It links the conversation to a listing when present.

Send message:

```json
{
  "text": "Hello! Is the boat available?"
}
```

Conversation message lists use cursor pagination.

### Chat WebSocket

```text
/ws/chat/conversations/<conversation_id>/
```

The chat WebSocket uses the HttpOnly JWT access cookie. Anonymous users or users who are not participants in the conversation are rejected.

Supported client actions:

```json
{ "type": "message.send", "text": "Hello" }
```

```json
{ "type": "message.read" }
```

```json
{ "type": "message.delete", "message_id": 123 }
```

## Notifications

Base path:

```text
/api/notifications/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/notifications/` | List my notifications | Authenticated |
| POST | `/api/notifications/mark-all-read/` | Mark all notifications as read | Authenticated + CSRF |
| POST/PATCH | `/api/notifications/<id>/read/` | Mark one notification as read | Authenticated + CSRF |

### Notifications WebSocket

```text
/ws/notifications/
```

The notifications WebSocket uses the authenticated user's JWT cookie and only sends notifications scoped to that user.

## Favorites

Base path:

```text
/api/favorites/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/favorites/` | List my favorite boats | Authenticated |
| POST | `/api/favorites/` | Add a favorite | Authenticated + CSRF |
| DELETE | `/api/favorites/<favorite_id>/` | Remove a favorite | Authenticated + CSRF |

Create favorite:

```json
{
  "boat_id": 123
}
```

## Reviews

Base path:

```text
/api/reviews/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/reviews/boats/<boat_id>/` | List reviews for a boat, including stats | Public |
| GET | `/api/reviews/users/<user_id>/` | List reviews for a user, including stats | Public |
| POST | `/api/reviews/create/` | Create review for an eligible completed booking | Authenticated + CSRF |
| GET | `/api/reviews/my-reviewable-bookings/` | List bookings current user may review | Authenticated |

Review list responses include review stats such as average rating and review count.

## Geocoding

Base path:

```text
/api/geocoding/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/geocoding/search/?q=<query>` | Search for locations | Authenticated |
| GET | `/api/geocoding/reverse/?lat=<lat>&lon=<lon>` | Reverse geocode coordinates | Authenticated |

The frontend location picker uses these endpoints to search for public area names and to resolve selected coordinates into address/location details.

## Reports

Base path:

```text
/api/reports/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/reports/` | Report a listing, user, review, or chat message | Authenticated + CSRF |

Report request body:

```json
{
  "target_type": "listing",
  "target_id": 123,
  "reason": "scam",
  "details": "This listing looks suspicious."
}
```

Supported `target_type` values:

```text
listing
user
review
message
```

Supported `reason` values:

```text
scam
inappropriate
harassment
safety
wrong_info
spam
other
```

A user cannot report themselves, their own listing, their own review, their own message, or messages outside their own conversations. Duplicate reports for the same target by the same reporter are rejected.

## Moderation

Base path:

```text
/api/moderation/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/moderation/reports/` | List moderation reports | Admin/staff |
| GET | `/api/moderation/reports/stats/` | Report count summary for the moderation dashboard | Admin/staff |
| GET | `/api/moderation/reports/<report_id>/` | Retrieve one moderation report | Admin/staff |
| PATCH | `/api/moderation/reports/<report_id>/` | Update report status/admin notes | Admin/staff + CSRF |

Moderation report filters:

| Parameter | Description |
| --- | --- |
| `status` | `pending`, `reviewing`, `resolved`, or `dismissed` |
| `target_type` | `listing`, `user`, `review`, or `message` |
| `reason` | One of the report reason values |
| `q` | Search report details, notes, reporter, target, review text, or message text |
| `page` | Page number |
| `page_size` | Page size |

Update moderation report:

```json
{
  "status": "reviewing",
  "admin_notes": "Looking into this."
}
```

Changing a report to `resolved` or `dismissed` sets `resolved_at`. Reopening a resolved/dismissed report clears `resolved_at`.

## Permission summary

| Resource | Main permission rule |
| --- | --- |
| Public listings | Anyone can view |
| Create listing | Authenticated users |
| Edit/delete listing | Listing host only |
| Listing exact pickup data | Host, staff/admin, or confirmed renter in disclosure window |
| Booking create | Authenticated renters, not the boat owner |
| Booking confirm | Boat host only |
| Booking cancel/delete | Booking participant, subject to booking rules |
| Payment checkout/status | Visible booking participant |
| Chat conversation | Conversation participants only |
| Message delete | Message author only |
| Notifications | Owner only |
| Favorites | Owner only |
| Reviews | Public read, eligible authenticated users create |
| Reports | Authenticated users create |
| Moderation | Staff/admin users only |

## Security notes

- JWTs are stored in HttpOnly cookies.
- Unsafe requests require CSRF protection.
- Refresh tokens are rotated and can be blacklisted.
- Device/session records are used to revoke sessions.
- Login, signup, relationship, profile, booking, listing, geocoding, review, report, moderation, and condition endpoints have throttling where configured.
- Turnstile can be required for selected public auth flows.
- Public listing text is checked to avoid leaking private pickup details.
- Uploaded listing/profile images are validated and sanitized server-side.
- WebSocket connections authenticate using the same cookie-based JWT session.
- Report and moderation actions write audit events where configured.
- Public API responses should avoid exposing private pickup details or private account data.
