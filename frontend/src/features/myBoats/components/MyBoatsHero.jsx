import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

function HeroMetric({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
      <div className="flex items-center gap-2 text-white/75">
        {icon}
        <span className="text-xs font-bold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
    </div>
  )
}

export default function MyBoatsHero({
  totalBoats = 0,
  pendingCount = 0,
  confirmedCount = 0,
}) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-slate-950 shadow-soft">
      <div className="relative bg-gradient-to-r from-navy via-ocean to-slate-900 px-6 py-8 text-white md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-white/10 p-5 text-white/80 md:block">
          <SparklesIcon className="h-10 w-10" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
              Host dashboard
            </span>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-5xl">
              Manage your boats and bookings
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
              Keep your listings updated, respond to incoming requests, and manage
              your hosting activity from one clean dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/add-boat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:brightness-95"
              >
                <PlusIcon className="h-5 w-5" />
                Add boat
              </Link>

              <Link
                to="/host-bookings"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                Manage bookings
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <HeroMetric
              icon={<CalendarDaysIcon className="h-4 w-4 text-gold" />}
              label="Listings"
              value={totalBoats}
            />
            <HeroMetric
              icon={<SparklesIcon className="h-4 w-4 text-gold" />}
              label="Pending"
              value={pendingCount}
            />
            <HeroMetric
              icon={<CheckCircleIcon className="h-4 w-4 text-gold" />}
              label="Confirmed"
              value={confirmedCount}
            />
          </div>
        </div>
      </div>
    </section>
  )
}