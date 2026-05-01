import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
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

export default function BookingsHero({ counts = {} }) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-slate-100 bg-gradient-to-br from-white via-sky-50 to-white px-6 py-8 md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-white p-5 text-navy shadow-sm ring-1 ring-slate-200 md:block">
          <CalendarDaysIcon className="h-10 w-10" />
        </div>

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-gold" />
            Renter dashboard
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            My bookings
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Keep track of pending requests, upcoming trips, active rentals, completed
            adventures, and cancellations.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-ocean"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              Browse boats
            </Link>

            <Link
              to="/messages"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Messages
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 md:px-8">
        <HeroMetric
          icon={<ClockIcon className="h-4 w-4 text-amber-600" />}
          label="Pending"
          value={counts.pending ?? 0}
          text="Waiting for host approval"
        />

        <HeroMetric
          icon={<CalendarDaysIcon className="h-4 w-4 text-indigo-600" />}
          label="Upcoming"
          value={counts.upcoming ?? 0}
          text="Confirmed future trips"
        />

        <HeroMetric
          icon={<SparklesIcon className="h-4 w-4 text-sky-600" />}
          label="Active"
          value={counts.active ?? 0}
          text="Currently on trip"
        />

        <HeroMetric
          icon={<CheckCircleIcon className="h-4 w-4 text-emerald-600" />}
          label="Completed"
          value={counts.completed ?? 0}
          text="Finished bookings"
        />
      </div>
    </section>
  )
}