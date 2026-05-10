const journeyStops = [
  {
    title: 'Frontend harbor',
    icon: '⚓',
    text: 'React routes, pages, forms, maps, and feature components guide the user through the product.',
  },
  {
    title: 'API route',
    icon: '⛵',
    text: 'Shared API modules carry requests from the interface to the backend in a predictable way.',
  },
  {
    title: 'Backend compass',
    icon: '🧭',
    text: 'Django validates input, checks access, applies domain rules, and coordinates database changes.',
  },
  {
    title: 'Infrastructure island',
    icon: '🏝️',
    text: 'PostgreSQL/PostGIS, Redis, Docker, Nginx, Cloudflare, DigitalOcean, and Let\'s Encrypt support the deployed app.',
  },
]

export default function ArchitectureJourney() {
  return (
    <section className="border-t border-white/10 py-9">
      <h2 className="text-2xl font-extrabold tracking-tight text-white">
        Architecture journey
      </h2>

      <div className="mt-4 max-w-4xl space-y-4 text-base leading-8 text-white/72">
        <p>
          This route shows the normal path through TideMate: a user action starts
          in the browser, moves through the frontend API layer, reaches backend
          domain logic, and then returns with data from the supporting services.
        </p>
      </div>

      <div className="relative mt-8">
        <div className="absolute left-6 top-0 h-full border-l border-dashed border-gold/40 md:left-0 md:right-0 md:top-12 md:h-0 md:border-l-0 md:border-t" />

        <div className="grid gap-6 md:grid-cols-4">
          {journeyStops.map((stop) => (
            <article
              key={stop.title}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-[#071d32] text-2xl">
                {stop.icon}
              </div>

              <h3 className="text-lg font-extrabold text-white">
                {stop.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-white/70">
                {stop.text}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/65">
        <p>
          Browser → frontend feature → API module → Django endpoint → serializer,
          selector, service, and permission layer → database or external service
          → response back to the user interface.
        </p>
      </div>
    </section>
  )
}
