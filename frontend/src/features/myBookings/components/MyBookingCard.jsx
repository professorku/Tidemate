import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import {
  formatBookingWindow,
  getDateHint,
  getTimelineLabel,
  getTimelineStatus,
  timelineBadgeClasses,
} from '../utils/bookingFormatters'
import BookingCardActions from './BookingCardActions'
import BookingCardDetails from './BookingCardDetails'
import BookingCardHeader from './BookingCardHeader'
import BookingCardReviewSection from './BookingCardReviewSection'

export default function BookingCard({
  booking,
  onCancel,
  onDelete,
  cancellingId,
  deletingId,
  onRefresh,
}) {
  const { revealed, toggle, hide, bind } = useLongPressReveal()

  const timelineStatus = getTimelineStatus(booking)
  const bookingWindow = formatBookingWindow(booking)
  const messageLink = booking.conversation_id
    ? `/messages/${booking.conversation_id}`
    : '/messages'

  const canCancel = Boolean(booking.can_cancel)
  const canDelete = timelineStatus === 'completed' || timelineStatus === 'cancelled'
  const isDeleting = deletingId === booking.id
  const isCancelling = cancellingId === booking.id
  const isUpcoming = timelineStatus === 'upcoming' || timelineStatus === 'pending'
  const isActive = timelineStatus === 'active'
  const isCompleted = timelineStatus === 'completed'
  const isCancelled = timelineStatus === 'cancelled'

  return (
    <article
      {...bind}
      className={`relative overflow-hidden rounded-[30px] border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
        isCancelled
          ? 'border-red-200'
          : isActive
            ? 'border-sky-200'
            : 'border-slate-200'
      }`}
    >
      <BookingCardActions
        canDelete={canDelete}
        revealed={revealed}
        toggle={toggle}
        hide={hide}
        isDeleting={isDeleting}
        booking={booking}
        onDelete={onDelete}
      />

      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="relative min-h-[240px] bg-slate-100">
          {booking.boat_image ? (
            <img
              src={booking.boat_image}
              alt={booking.boat_title || 'Boat'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center text-slate-400">
              <CalendarDaysIcon className="h-12 w-12" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${timelineBadgeClasses(
                timelineStatus
              )}`}
            >
              {getTimelineLabel(timelineStatus)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Booking #{booking.id}
            </p>
            <h2 className="mt-1 line-clamp-2 text-2xl font-extrabold tracking-tight">
              {booking.boat_title || 'Boat'}
            </h2>
            <p className="mt-2 text-sm font-medium text-white/85">
              {getDateHint(booking, timelineStatus)}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
          <BookingCardHeader
            booking={booking}
            timelineStatus={timelineStatus}
            isCancelled={isCancelled}
            isCompleted={isCompleted}
          />

          <BookingCardDetails
            booking={booking}
            bookingWindow={bookingWindow}
            timelineStatus={timelineStatus}
          />

          {revealed && canDelete ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Delete is available because this booking is {timelineStatus}.
            </div>
          ) : null}

          {isUpcoming ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Policy:</span>{' '}
              {booking?.cancellation_policy?.short_text ||
                booking?.rental_policy?.short_text ||
                'View your booking details for the trip and cancellation policy.'}
            </div>
          ) : null}

          {isActive ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              Your trip is in progress. Keep pickup and return information available,
              and message the host if anything changes.
            </div>
          ) : null}

          {booking.cancellation_reason ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Cancellation reason
              </p>
              <p className="mt-1 text-sm leading-6 text-red-800">
                {booking.cancellation_reason}
              </p>
            </div>
          ) : null}

          <BookingCardReviewSection
            booking={booking}
            isCompleted={isCompleted}
            onRefresh={onRefresh}
          />

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Link
              to={`/bookings/${booking.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-ocean"
            >
              <EyeIcon className="h-4 w-4" />
              View booking
            </Link>

            <Link
              to={messageLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Messages
            </Link>

            {canCancel ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircleIcon className="h-4 w-4" />
                {isCancelling ? 'Cancelling...' : 'Cancel booking'}
              </button>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete(booking)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}