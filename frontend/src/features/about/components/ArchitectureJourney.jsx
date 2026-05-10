const journeyStops = [
  {
    title: 'Frontend harbor',
    icon: '⚓',
    text: 'React routes, pages, forms, maps, and feature components guide the user.',
  },
  {
    title: 'API route',
    icon: '⛵',
    text: 'Shared API modules carry requests from the interface to the backend.',
  },
  {
    title: 'Harbor gate',
    icon: '🛡️',
    text: 'Sessions, CSRF, role checks, and ownership rules guard access.',
  },
  {
    title: 'Backend compass',
    icon: '🧭',
    text: 'Django validates input, applies rules, and coordinates data changes.',
  },
  {
    title: 'Signal lighthouse',
    icon: '🔦',
    text: 'WebSockets support realtime chat and notification updates.',
  },
  {
    title: 'Infrastructure island',
    icon: '🏝️',
    text: "PostgreSQL/PostGIS, Redis, Docker, Nginx, Cloudflare, DigitalOcean, and Let's Encrypt support deployment.",
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
        <div className="pointer-events-none absolute left-8 right-8 top-9 z-20 hidden border-t border-dashed border-gold/45 xl:block" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {journeyStops.map((stop) => (
            <article
              key={stop.title}
              className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10"
            >
              <div className="relative z-30 mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/35 bg-[#071d32] text-xl shadow-lg shadow-black/20">
                  {stop.icon}
                </div>
              </div>

              <h3 className="text-base font-extrabold leading-snug text-white">
                {stop.title}
              </h3>

              <p className="mt-3 text-xs leading-6 text-white/68">
                {stop.text}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-[#071d32] text-xs leading-6 text-white/55">
        <p className="mt-6 text-xs leading-6 text-white/55">
          Browser → frontend feature → API module → access checks → Django domain logic
          → database, realtime, or external services → response back to the user
          interface.
        </p>
      </div>
    </section>
  )
}