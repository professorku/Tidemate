import Section from '../components/Section'

const REPOSITORY_URL = 'https://github.com/professorku/Tidemate'

export default function OverviewTab() {
  return (
    <>
      <Section title="Project overview">
        <p>
          My vision with TideMate was to build more than a simple demo page. I wanted
          to create a realistic full-stack product where the main parts of a rental
          platform had to work together: discovery, hosting, booking, payment,
          communication, trust, and follow-up after a trip.
        </p>

        <p>
          The project became a boat rental marketplace with separate experiences for
          renters, hosts, and staff users. Renters can explore available boats and
          request trips. Hosts can publish boats and manage incoming requests. Staff
          users can review reports and help keep user-generated content under control.
        </p>

        <p>
          Instead of building one isolated feature, TideMate was designed around how a
          real application behaves when several flows depend on each other. A listing
          is connected to a host, a booking is connected to both renter and owner,
          payments depend on booking status, and communication happens around the trip
          itself.
        </p>
      </Section>

      <Section title="Core functionality">
        <p>
          TideMate includes public boat listings, host-managed boats, booking
          requests, Stripe checkout, realtime chat, notifications, reviews, favorites,
          reports, moderation tools, maps, and image uploads.
        </p>

        <p>
          These features are connected through the same product experience instead of
          being separate showcase components. The goal is that a reviewer can follow
          the application from browsing a boat, to requesting a rental, to managing
          the trip from both the renter and host side.
        </p>
      </Section>

      <Section title="Technical foundation">
        <p>
          The frontend is built with React, Vite, React Router, and Tailwind CSS. The
          backend uses Django, Django REST Framework, and Django Channels, with
          PostgreSQL/PostGIS for data and location features, Redis for realtime
          support, and Stripe for checkout.
        </p>

        <p>
          The application is deployed with Docker Compose, Nginx, DigitalOcean,
          Cloudflare, and HTTPS through Let&apos;s Encrypt. Stripe checkout can be
          tested with the demo card number 4242 4242 4242 4242.
        </p>
      </Section>

      <Section title="Project purpose">
        <p>
          I chose this project because it forced me to work across the full stack
          instead of only focusing on the visual side of web development. TideMate
          includes frontend state, backend APIs, database design, access control,
          media handling, third-party integrations, realtime features, and deployment
          on a public domain.
        </p>

        <p>
          TideMate is a personal portfolio and university project, but it is organized
          with real application boundaries in mind. The purpose is to show how I think
          about building, structuring, securing, and deploying a larger web
          application from idea to working product.
        </p>
      </Section>
    </>
  )
}