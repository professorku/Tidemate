import BulletList from '../components/BulletList'
import Section from '../components/Section'

export default function SecurityTab() {
  return (
    <>
      <Section title="Security approach">
        <p>
          TideMate handles more than static content. Users can create accounts,
          publish listings, request bookings, pay for approved rentals, send
          messages, upload images, write reviews, and report content. Because of
          that, the security model is built around controlled access rather than
          only hiding buttons in the interface.
        </p>

        <p>
          The main idea is simple: every action should match the current user,
          their role, and the object they are trying to access. A renter, host,
          staff user, and anonymous visitor should all have different boundaries.
        </p>
      </Section>

      <Section title="Session and request safety">
        <p>
          Login sessions are designed so sensitive tokens are not stored in
          JavaScript-readable browser storage. The frontend can know that a user
          appears logged in, but the backend remains responsible for the actual
          session and permission checks.
        </p>

        <p>
          Write requests are treated with more care than simple reads. Actions
          that create, update, or delete data require protection against unwanted
          requests from other websites, which is especially important when
          authentication is cookie-based.
        </p>
      </Section>

      <Section title="Access boundaries">
        <p>
          TideMate has several places where ownership matters. A listing belongs
          to a host, a booking connects a renter and a host, a conversation belongs
          to its participants, and moderation tools belong only to staff users.
        </p>

        <BulletList
          items={[
            'Renters should only manage bookings they are part of.',
            'Hosts should only edit boat listings they own.',
            'Users should only read conversations they participate in.',
            'Notifications should only be visible to the user they belong to.',
            'Payment actions should stay connected to the correct booking participant.',
            'Staff moderation routes should not be available to normal users.',
          ]}
        />

        <p>
          These checks have to happen on the server side. The frontend can make the
          interface cleaner, but it should not be the final security boundary.
        </p>
      </Section>

      <Section title="Booking and payment protection">
        <p>
          The booking flow is intentionally step-based. A renter sends a request,
          the host approves it, and payment only becomes available after that
          approval. This keeps checkout connected to a valid booking state instead
          of allowing payment too early in the process.
        </p>

        <p>
          The booking status becomes part of the protection model. Different users
          see different next actions depending on whether the booking is pending,
          awaiting payment, confirmed, active, completed, or cancelled, while the
          backend still verifies that each transition is allowed.
        </p>
      </Section>

      <Section title="User content and moderation">
        <p>
          TideMate accepts user-generated content through listings, profiles,
          reviews, chat messages, reports, and uploaded images. That means user
          input has to be treated as untrusted until it has been validated,
          checked, or moderated.
        </p>

        <p>
          Reporting and moderation give the project a controlled way to handle
          problematic content. Normal users can report something, while staff users
          get a separate review flow for deciding what should happen next.
        </p>
      </Section>

      <Section title="Upload safety">
        <p>
          Image uploads are handled by the backend instead of trusting files
          directly from the browser. Uploaded images are validated, processed, and
          stored in a safer format before they are shown back in the application.
        </p>

        <BulletList
          items={[
            'Uploaded files are checked before storage.',
            'Invalid, corrupted, or excessive images are rejected.',
            'Image metadata is stripped to reduce unnecessary private information.',
            'Large images are resized to a web-friendly size.',
            'Stored images are re-encoded instead of keeping the original upload unchanged.',
          ]}
        />
      </Section>

      <Section title="Realtime protection">
        <p>
          Chat and notifications use realtime connections, but they follow the
          same access idea as the normal API. A user should only receive live data
          for conversations and notifications they are allowed to access.
        </p>

        <p>
          This matters because realtime features can otherwise leak information
          quickly. Conversation membership, notification ownership, authenticated
          sessions, and payload limits are all part of keeping those channels
          controlled.
        </p>
      </Section>

      <Section title="Public deployment">
        <p>
          TideMate is available through a public domain, so deployment is part of
          the security surface. HTTPS is handled with a Let&apos;s Encrypt
          certificate, Cloudflare sits in front for DNS and edge protection, and
          Nginx routes traffic to the application services.
        </p>

        <p>
          Secrets, cookie settings, security headers, media responses, WebSocket
          routing, and reverse proxy behavior all affect how safe the deployed
          application is in practice. The project is still a portfolio demo, but
          the deployment is treated like something real users could reach.
        </p>
      </Section>

      <Section title="Security summary">
        <p>
          The security direction in TideMate is controlled access, safer handling
          of user content, protected booking transitions, and production-aware
          deployment. The frontend guides the user, but the backend owns the final
          decisions around sessions, permissions, validation, uploads, payments,
          and realtime access.
        </p>

        <p>
          The goal is not to claim that TideMate is a finished commercial service,
          but to show that the project considers the same kinds of risks a real
          full-stack application has to handle.
        </p>
      </Section>
    </>
  )
}
