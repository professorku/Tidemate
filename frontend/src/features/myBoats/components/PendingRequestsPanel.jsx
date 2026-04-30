import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { formatCurrency } from '../../../utils/format/number'
import {
  formatBoatType,
  formatDate,
} from '../../hostBookings/utils/bookingFormatters'

function PendingSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex gap-3">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PendingRequestCard({ booking }) {
  const messageHref = booking.conversation_id
    ? `/messages/${booking.conversation_id}`
    : '/messages'

  return (
    <article className="overflow-hidden rounded-[26px] border border-amber-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative h-36 bg-slate-200">
        {booking.boat_image ? (
          <img
            src={booking.boat_image}
            alt={booking.boat_title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <CalendarDaysIcon className="h-10 w-10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        <div className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 ring-1 ring-amber-200">
          Pending
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="truncate text-lg font-extrabold">{booking.boat_title}</h3>
          <p className="mt-1 text-sm text-white/80">
            {formatBoatType(booking.boat_type)} · {booking.boat_guests} guests
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          {booking.renter_avatar ? (
            <img
              src={booking.renter_avatar}
              alt={booking.renter_username}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserCircleIcon className="h-6 w-6" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Renter
            </p>
            <Link
              to={`/users/${booking.renter_id || booking.renter}`}
              className="truncate text-sm font-bold text-navy hover:underline"
            >
              {booking.renter_username}
            </Link>
          </div>
        </div>

        <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Dates</span>
            <span className="font-semibold text-slate-900">
              {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Value</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(booking.total_price)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/bookings/${booking.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-3 py-2.5 text-sm font-bold text-white transition hover:bg-ocean"
          >
            Review
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <Link
            to={messageHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Message
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function PendingRequestsPanel({
  requests,
  loading,
  error,
  onRetry,
}) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white/85 p-4 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
            Needs attention
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Pending booking requests
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Quick preview of incoming renter requests. Open a booking to confirm,
            cancel, or inspect full details.
          </p>
        </div>

        <Link
          to="/host-bookings"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          View all requests
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {loading ? <PendingSkeleton /> : null}

      {!loading && error ? (
        <div className="flex items-start gap-3 rounded-[24px] border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">Could not load pending requests</p>
            <p className="mt-1 leading-6">{error}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Try again
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {!loading && !error && requests.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 ring-1 ring-slate-200">
            <InboxIcon className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-xl font-extrabold text-slate-900">
            No pending requests
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            New booking requests will appear here, so you can respond quickly.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <ClockIcon className="h-4 w-4" />
            You are all caught up
          </div>
        </div>
      ) : null}

      {!loading && !error && requests.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {requests.map((booking) => (
            <PendingRequestCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : null}
    </section>
  )
}