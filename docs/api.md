# Tidemate API Overview

This document gives a high-level overview of the main Tidemate backend API endpoints.

The backend is a Django REST Framework API. Authentication uses JWT access and refresh tokens stored in HttpOnly cookies. Unsafe authenticated requests must include a valid CSRF token.

## Base URL

Local development:

```text
http://localhost:8000/api/
```

Production:

```text
https://your-backend-domain/api/
```

## Authentication and users

Base path:

```text
/api/users/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/users/health/` | Health check endpoint | Public |
| GET | `/api/users/csrf/` | Sets/returns CSRF cookie | Public |
| POST | `/api/users/signup/` | Create inactive account and send verification email | Public + CSRF |
| POST | `/api/users/login/` | Login and set JWT cookies | Public + CSRF |
| POST | `/api/users/refresh/` | Rotate/refresh JWT cookies | Cookie auth + CSRF |
| POST | `/api/users/logout/` | Logout, clear cookies, revoke refresh/session | Cookie auth + CSRF |
| GET/PATCH | `/api/users/me/` | Read or update authenticated user profile | Authenticated |
| POST | `/api/users/change-password/` | Change password and revoke sessions | Authenticated + CSRF |
| POST | `/api/users/forgot-password/` | Request password reset email | Public + CSRF |
| POST | `/api/users/reset-password/` | Reset password using token | Public + CSRF |
| GET/POST | `/api/users/verify-email/` | Verify newly created account email | Public |
| GET/POST | `/api/users/verify-email-change/` | Confirm pending email change | Auth/token-based |
| POST | `/api/users/resend-verification/` | Resend verification email | Public + CSRF |
| GET | `/api/users/<user_id>/` | Public user profile | Public |
| POST | `/api/users/<user_id>/crew/` | Toggle crewmate/friend relation | Authenticated + CSRF |
| POST | `/api/users/<user_id>/block/` | Block/unblock another user | Authenticated + CSRF |

## Listings

Base path:

```text
/api/listings/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/listings/` | List/search boat listings | Public |
| POST | `/api/listings/` | Create a boat listing | Authenticated + CSRF |
| GET | `/api/listings/<id>/` | Retrieve one boat listing | Public |
| GET | `/api/listings/mine/` | List authenticated user's own boats | Authenticated |
| PATCH/DELETE | `/api/listings/mine/<id>/` | Update or delete own boat listing | Owner + CSRF |
| GET | `/api/listings/<id>/conditions/` | Get weather/marine conditions for listing | Public |

### Listing location privacy

Public listing responses expose approximate map coordinates. Exact pickup address, pickup instructions, and exact coordinates are only shown to:

- the listing host
- staff/admin users
- confirmed renters during the configured exact-location disclosure window

Public listing text is validated to avoid leaking exact street addresses, dock/slip identifiers, postcodes, or raw coordinates.

## Bookings

Base path:

```text
/api/bookings/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/bookings/` | Create a booking request | Authenticated + CSRF |
| GET | `/api/bookings/my/` | List bookings made by the authenticated renter | Authenticated |
| GET | `/api/bookings/host/` | List bookings for boats owned by the authenticated host | Authenticated host |
| GET | `/api/bookings/<id>/` | Retrieve a visible booking | Authenticated participant |
| POST | `/api/bookings/<id>/confirm/` | Confirm a pending booking | Host + CSRF |
| POST | `/api/bookings/<id>/cancel/` | Cancel a booking | Booking participant + CSRF |
| DELETE | `/api/bookings/<id>/delete/` | Delete/archive a visible booking | Booking participant + CSRF |

Booking creation and confirmation use service-layer validation to prevent overlapping confirmed bookings.

## Chat

Base path:

```text
/api/chat/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/chat/conversations/` | List my conversations | Authenticated |
| GET | `/api/chat/conversations/<conversation_id>/` | Retrieve one conversation | Conversation participant |
| POST | `/api/chat/direct/start/` | Start or retrieve direct conversation | Authenticated + CSRF |
| GET/POST | `/api/chat/conversations/<conversation_id>/messages/` | List or send messages | Conversation participant |
| DELETE | `/api/chat/conversations/<conversation_id>/delete/` | Delete/hide conversation for current user | Conversation participant + CSRF |
| DELETE | `/api/chat/messages/<message_id>/delete/` | Delete own message | Message author + CSRF |

### Chat WebSocket

```text
/ws/chat/conversations/<conversation_id>/
```

The WebSocket connection uses the HttpOnly JWT access cookie. Anonymous users or users who are not participants in the conversation are rejected.

Supported message actions include:

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
| POST | `/api/notifications/<id>/read/` | Mark one notification as read | Authenticated + CSRF |

### Notifications WebSocket

```text
/ws/notifications/
```

The notifications WebSocket uses the authenticated user's JWT cookie.

## Favorites

Base path:

```text
/api/favorites/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/favorites/` | List my favorite boats | Authenticated |
| POST | `/api/favorites/` | Add a favorite | Authenticated + CSRF |
| DELETE | `/api/favorites/<id>/` | Remove a favorite | Authenticated + CSRF |

## Reviews

Base path:

```text
/api/reviews/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/reviews/boats/<boat_id>/` | List reviews for a boat | Public |
| GET | `/api/reviews/users/<user_id>/` | List reviews for a user | Public |
| POST | `/api/reviews/create/` | Create review for eligible completed booking | Authenticated + CSRF |
| GET | `/api/reviews/my-reviewable-bookings/` | List bookings current user may review | Authenticated |

## Geocoding

Base path:

```text
/api/geocoding/
```

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/geocoding/search/` | Search for locations | Public or authenticated depending on deployment policy |
| GET | `/api/geocoding/reverse/` | Reverse geocode coordinates | Public or authenticated depending on deployment policy |

## Permission summary

| Resource | Main permission rule |
| --- | --- |
| Public listings | Anyone can view |
| Create listing | Authenticated users |
| Edit/delete listing | Listing host only |
| Booking create | Authenticated renters, not the boat owner |
| Booking confirm | Boat host only |
| Booking cancel/delete | Booking participant, subject to booking rules |
| Chat conversation | Conversation participants only |
| Message delete | Message author only |
| Notifications | Owner only |
| Favorites | Owner only |
| Reviews | Users with eligible completed bookings |

## Security notes

- JWTs are stored in HttpOnly cookies.
- Unsafe requests require CSRF protection.
- Refresh tokens are rotated and can be blacklisted.
- Login and write-heavy endpoints are throttled.
- Public listing text is checked to avoid leaking private pickup details.
- Uploaded boat images are validated and sanitized server-side.
- WebSocket connections authenticate using the same cookie-based JWT session.
