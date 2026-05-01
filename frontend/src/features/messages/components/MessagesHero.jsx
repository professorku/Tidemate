import { Link } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

export default function MessagesHero({ totalCount = 0, unreadCount = 0 }) {
  return (
    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
      <div className="relative border-b border-slate-100 bg-gradient-to-br from-white via-sky-50 to-white px-6 py-8 md:px-8 md:py-10">
        <div className="absolute right-8 top-8 hidden rounded-full bg-white p-5 text-navy shadow-sm ring-1 ring-slate-200 md:block">
          <ChatBubbleLeftRightIcon className="h-10 w-10" />
        </div>

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-gold" />
            Message center
          </span>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Chat with renters and hosts
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            Follow up on bookings, ask about pickup, confirm details, and keep all
            TideMate communication organized.
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
              to="/notifications"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Notifications
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-6 py-5 md:grid-cols-2 md:px-8">
        <div className="rounded-[22px] bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total threads
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{totalCount}</p>
        </div>

        <div
          className={`rounded-[22px] px-4 py-3 ${
            unreadCount > 0
              ? 'border border-amber-200 bg-amber-50'
              : 'border border-emerald-200 bg-emerald-50'
          }`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              unreadCount > 0 ? 'text-amber-700' : 'text-emerald-700'
            }`}
          >
            Unread
          </p>
          <p
            className={`mt-1 text-2xl font-extrabold ${
              unreadCount > 0 ? 'text-amber-900' : 'text-emerald-900'
            }`}
          >
            {unreadCount > 0 ? `${unreadCount} need attention` : 'All caught up'}
          </p>
        </div>
      </div>
    </section>
  )
}