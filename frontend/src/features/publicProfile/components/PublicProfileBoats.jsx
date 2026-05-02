import { Link } from 'react-router-dom'
import { LifebuoyIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import EmptyState from '../../../components/ui/EmptyState'
import { formatCurrency } from '../../../utils/format/number'

export default function PublicProfileBoats({ boats, profile }) {
  return (
    <section className="rounded-[32px] border border-white/15 bg-navy p-6 text-white shadow-soft md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
            Boats
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Boats from {profile.username}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
            Public listings connected to this host profile.
          </p>
        </div>

        <p className="rounded-full border border-white/15 bg-[#071d32] px-4 py-2 text-sm font-bold text-white/70">
          {boats.length} public boat{boats.length === 1 ? '' : 's'}
        </p>
      </div>

      {boats.length === 0 ? (
        <div className="mt-6 [&>div]:border-white/20 [&>div]:bg-white/10 [&_h2]:text-white [&_p]:text-white/65">
          <EmptyState
            icon={<LifebuoyIcon className="h-8 w-8" />}
            title="No public boats yet"
            text={`${profile.username} has not published any boats yet. Check back later to see new listings.`}
            compact={false}
            tone="neutral"
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boats.map((boat) => {
            const guestsLabel = `${boat.guests || 0} guest${boat.guests === 1 ? '' : 's'}`

            return (
              <Link
                key={boat.id}
                to={`/boats/${boat.id}`}
                className="group overflow-hidden rounded-[26px] border border-white/15 bg-white/10 shadow-sm transition hover:-translate-y-1 hover:border-gold/30 hover:bg-white/15 hover:shadow-lg"
              >
                <div className="h-48 overflow-hidden bg-[#071d32]">
                  {boat.image ? (
                    <img
                      src={boat.image}
                      alt={boat.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/50">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-extrabold text-white">
                        {boat.title}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/15">
                          <MapPinIcon className="h-4 w-4 text-gold" />
                          {boat.location_name || 'Location not added'}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/15">
                          <UserGroupIcon className="h-4 w-4 text-gold" />
                          {guestsLabel}
                        </span>
                      </div>
                    </div>

                    <span className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-navy">
                      Listed
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-white/45">
                        Price per day
                      </p>

                      <p className="mt-1 text-lg font-extrabold text-white">
                        {formatCurrency(boat.price_per_day)}
                      </p>
                    </div>

                    <span className="text-sm font-bold text-gold">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}