import ArchitectureJourney from '../components/ArchitectureJourney'
import BulletList from '../components/BulletList'
import Section from '../components/Section'

export default function ArchitectureTab() {
  return (
    <>
    <Section title="Architecture overview">
      <p>
        TideMate is built as a full-stack application with a clear split between
        the client, the server, and the production environment around them. The
        React frontend is responsible for the user experience: pages, forms,
        maps, navigation, local interface state, and calling the API. The Django
        backend is responsible for the parts that must be trusted and
        consistent: authentication, validation, permissions, database changes,
        booking rules, payment-related logic, uploads, and realtime access.
      </p>

      <p>
        The goal is not to make every file small just for the sake of it, but to
        make the project easier to reason about. When a new feature is added, it
        should be clear where the page code, API function, validation rule,
        database query, and business operation should live. That structure makes
        the codebase easier to debug because the same type of problem is usually
        handled in the same type of place.
      </p>
    </Section>

    <ArchitectureJourney/>

    <Section title="Frontend organization">
      <p>
        The frontend is organized around the main areas of the product, with
        feature folders used for pages, components, hooks, and helpers that only
        make sense inside one flow. Shared folders are used more carefully:
        `src/api` contains the shared API client and backend-facing functions,
        `src/components/ui` contains generic visual building blocks,
        `src/components` contains reusable product components, `src/context`
        contains app-wide state, and `src/hooks` and `src/utils` contain small
        reusable helpers.
      </p>

      <p>
        This keeps route-level pages from becoming too large. A page should
        describe what the user sees and connect the necessary pieces, while
        repeated request logic, formatting, shared UI, and cross-app state live
        somewhere more predictable. The result is that a listing page, booking
        page, chat page, or moderation page can grow without every detail ending
        up in the route file itself.
      </p>
    </Section>

    <Section title="Backend organization">
      <p>
        The backend is split into Django apps for the main product areas:
        users, listings, bookings, payments, chat, notifications, favorites,
        reviews, reports, moderation, geocoding, and audit logging. Each app
        contains the code needed for that part of the system, but the files
        inside the app still have different responsibilities.
      </p>

      <p>
        Views expose the HTTP endpoints and coordinate the request. Serializers
        validate input and shape API responses. Selectors collect reusable read
        queries. Services handle write operations, transactions, and business
        behavior. Permissions check roles, ownership, and object-level access.
        Tests verify important behavior without depending only on manual browser
        testing. This separation keeps large product flows, such as booking or
        messaging, from turning into one oversized view file.
      </p>
    </Section>

    <Section title="Request lifecycle">
      <p>
        Most user actions follow the same path through the system. The frontend
        collects input from the user and calls a shared API function. The request
        reaches a Django endpoint, where the backend validates the data, checks
        access, runs the relevant query or service operation, updates the
        database if needed, and returns a response that the frontend can use to
        update the interface.
      </p>

      <p>
        For example, creating a booking is not just a form submit. The frontend
        sends the selected boat and dates, but the backend has to check that the
        user is allowed to request the booking, that the listing exists, that the
        input is valid, and that the booking can move into the correct state.
        The same pattern applies to editing a listing, sending a chat message,
        updating a profile, saving a favorite, or reviewing a completed rental.
      </p>
    </Section>

    <Section title="Testing and maintainability">
      <p>
        Backend tests are included for important flows such as authentication,
        permissions, listings, bookings, reviews, favorites, moderation, and
        security-sensitive behavior. The point is to verify the rules close to
        the backend code that enforces them, instead of only checking the app by
        clicking through the frontend manually.
      </p>

      <p>
        The maintenance direction is to keep the project easy to extend without
        making it harder to understand. New UI code should start in the relevant
        product area, shared components should only be extracted when multiple
        places actually need them, API calls should stay behind shared API
        functions, repeated read logic should move into selectors, and write
        operations with business rules should move into services.
      </p>
    </Section>

    <Section title="Architecture summary">
      <p>
        TideMate uses the frontend for presentation, navigation, interaction,
        and API consumption, while the backend owns validation, persistence,
        permissions, sessions, uploads, payments, realtime access, and product
        rules. The architecture is meant to make the project understandable as a
        complete system, not just as a collection of pages.
      </p>

      <p>
        This structure also makes the project easier to explain during technical
        review. A reviewer can follow how a feature moves from the interface,
        through the API layer, into backend validation and domain logic, and back
        to the user as a finished response.
      </p>
    </Section>
    </>
  )
}
