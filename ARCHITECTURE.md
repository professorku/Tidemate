# Tidemate architecture notes

This project keeps the existing UX and core product logic, but standardizes where code should live so the repo stays easier to maintain.

## Frontend structure

Use these rules going forward:

- `src/api/`
  - low-level API client and domain API modules
  - no page logic here
- `src/components/ui/`
  - fully shared presentational building blocks
- `src/components/`
  - shared domain-level components used across multiple features
- `src/context/`
  - app-wide session, toast, and notification state
- `src/hooks/`
  - cross-feature reusable hooks
- `src/features/<feature-name>/`
  - page-specific components, hooks, and helpers for a single feature

## Frontend guardrails

Before creating a new file:

- Put it in a feature folder if it is only used by one feature.
- Put it in `components/ui` only if it is generic and reusable.
- Import API functions from `src/api/domains/*` when no feature-specific wrapper logic is needed.
- Prefer React Query invalidation and context methods over `window.dispatchEvent(...)`.

## Backend structure

The backend follows a domain-app layout:

- `users/`
- `listings/`
- `bookings/`
- `chat/`
- `notifications/`
- `favorites/`
- `reviews/`
- `config/`

Inside each app, keep these boundaries:

- `views.py` for HTTP entry points
- `serializers.py` for request/response validation
- `selectors.py` for read/query logic
- `services.py` for write/business logic
- `permissions.py` for object-level access checks

## Realtime and auth

- HTTP auth uses JWT cookies with CSRF enforcement for cookie-authenticated writes.
- WebSocket auth must stay aligned with session revocation.
- Realtime UI sync should prefer query invalidation and notification context refreshes.

