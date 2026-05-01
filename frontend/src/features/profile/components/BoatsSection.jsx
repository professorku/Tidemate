import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  MapPinIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/format/number'
import EmptyBoatsState from './EmptyBoatsState'

export default function BoatsSection({ boats }) {
  return (
    <section className="rounded-[28px] border border-white/15 bg-navy p-6 text-white shadow-soft md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            Hosting
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Your boats
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
            Listings connected to your account. Renters can request these boats when
            they are available.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/my-boats"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
          >
            Manage boats
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <Link
            to="/add-boat"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
          >
            <PlusIcon className="h-4 w-4" />
            Add listing
          </Link>
        </div>
      </div>

      {boats.length === 0 ? (
        <div className="mt-6">
          <EmptyBoatsState />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {boats.slice(0, 4).map((boat) => {
            const guestsLabel = `${boat.guests || 0} guest${boat.guests === 1 ? '' : 's'}`

            return (
              <Link
                key={boat.id}
                to={`/boats/${boat.id}`}
                className="group overflow-hidden rounded-[24px] border border-white/15 bg-white/10 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <div className="h-44 overflow-hidden bg-white/10">
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
                      View listing →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {boats.length > 4 ? (
        <div className="mt-5 text-center">
          <Link
            to="/my-boats"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
          >
            View all {boats.length} listings
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </section>
  )
}