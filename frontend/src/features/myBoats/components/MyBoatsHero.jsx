import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  LifebuoyIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function MyBoatsHero({ totalBoats = 0 }) {
  return (
    <section className="relative overflow-hidden rounded-[38px] border border-white/15 bg-navy px-5 py-7 text-white shadow-soft md:px-8 md:py-9">
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
            Manage your boats
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
            Keep your listings updated, improve your boat pages, and manage the fleet
            renters can book from you.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/add-boat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-black text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
            >
              <PlusIcon className="h-5 w-5" />
              Add boat
            </Link>

            <Link
              to="/host-bookings"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
            >
              <CalendarDaysIcon className="h-5 w-5" />
              Host bookings
            </Link>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/20 bg-navy p-5 shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Fleet overview
              </p>

              <p className="mt-4 text-5xl font-black tracking-tight text-white">
                {totalBoats}
              </p>

              <p className="mt-2 text-sm font-semibold text-white/75">
                Active listing{totalBoats === 1 ? '' : 's'} in your host account
              </p>
            </div>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
              <LifebuoyIcon className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/20 bg-navy px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
                <SparklesIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  Keep your listings sharp
                </p>

                <p className="mt-0.5 text-xs font-medium text-white/65">
                  Better photos and details make renters trust your boat faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}