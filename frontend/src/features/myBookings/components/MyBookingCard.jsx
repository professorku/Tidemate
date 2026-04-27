import { Link } from 'react-router-dom'
import BaseBookingCard from '../../../components/bookings/BaseBookingCard'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import { formatBookingWindow, getTimelineStatus } from '../utils/bookingFormatters'
import BookingCardActions from './BookingCardActions'
import BookingCardDetails from './BookingCardDetails'
import BookingCardHeader from './BookingCardHeader'
import BookingCardReviewSection from './BookingCardReviewSection'

export default function BookingCard({
  booking,
  onCancel,
  onDelete,
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
  const isUpcoming = timelineStatus === 'upcoming' || timelineStatus === 'pending'
  const isActive = timelineStatus === 'active'
  const isCompleted = timelineStatus === 'completed'
  const isCancelled = timelineStatus === 'cancelled'

  return (
    <BaseBookingCard
      bind={bind}
      menu={(
        <BookingCardActions
          canDelete={canDelete}
          revealed={revealed}
          toggle={toggle}
          hide={hide}
          isDeleting={isDeleting}
          booking={booking}
          onDelete={onDelete}
        />
      )}
      footer={(
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/bookings/${booking.id}`}
            className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View booking
          </Link>

          <Link
            to={messageLink}
            className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Messages
          </Link>

          {canCancel ? (
            <button
              type="button"
              onClick={() => onCancel(booking.id)}
              className="rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Cancel booking
            </button>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(booking)}
              disabled={isDeleting}
              className="rounded-full bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          ) : null}
        </div>
      )}
    >
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
        <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Policy:</span>{' '}
          {booking?.cancellation_policy?.short_text ||
            booking?.rental_policy?.short_text ||
            'View your booking details for the trip and cancellation policy.'}
        </div>
      ) : null}

      {isActive ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Your trip is in progress. Need help with pickup, return, or an issue on the water?
        </div>
      ) : null}

      {booking.cancellation_reason ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
            Cancellation reason
          </p>
          <p className="mt-1 text-sm text-red-800">{booking.cancellation_reason}</p>
        </div>
      ) : null}

      <BookingCardReviewSection
        booking={booking}
        isCompleted={isCompleted}
        onRefresh={onRefresh}
      />
    </BaseBookingCard>
  )
}
