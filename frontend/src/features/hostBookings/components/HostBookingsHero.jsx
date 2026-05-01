import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  LifebuoyIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

function HeroMetric({ icon, label, value, text }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>

      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      {text ? <p className="mt-1 text-xs text-slate-500">{text}</p> : null}
    </div>
  )
}

export default function HostBookingsHero({ stats = {} }) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-slate-100 bg-gradient-to-br from-white via-sky-50 to-white px-6 py-8 md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-white p-5 text-navy shadow-sm ring-1 ring-slate-200 md:block">
          <CalendarDaysIcon className="h-10 w-10" />
        </div>

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-gold" />
            Host booking center
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Host bookings
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Manage booking requests, confirmed trips, cancellations, and renter
            conversations for boats you host.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/my-boats"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-ocean"
            >
              <LifebuoyIcon className="h-5 w-5" />
              My boats
            </Link>

            <Link
              to="/add-boat"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:brightness-95"
            >
              <PlusIcon className="h-5 w-5" />
              Add boat
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
        <HeroMetric
          icon={<ClockIcon className="h-4 w-4 text-amber-600" />}
          label="Pending"
          value={stats.pending ?? 0}
          text="Awaiting response"
        />

        <HeroMetric
          icon={<CheckCircleIcon className="h-4 w-4 text-emerald-600" />}
          label="Confirmed"
          value={stats.confirmed ?? 0}
          text="Accepted trips"
        />

        <HeroMetric
          icon={<CalendarDaysIcon className="h-4 w-4 text-red-600" />}
          label="Cancelled"
          value={stats.cancelled ?? 0}
          text="Closed requests"
        />

        <HeroMetric
          icon={<LifebuoyIcon className="h-4 w-4 text-navy" />}
          label="Total"
          value={stats.all ?? 0}
          text="All host bookings"
        />
      </div>
    </section>
  )
}