import {
  CalendarDaysIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import BookingCardActionPanel from './bookingCard/BookingCardActionPanel'
import BookingCardCancellationNotice from './bookingCard/BookingCardCancellationNotice'
import BookingCardDetailsGrid from './bookingCard/BookingCardDetailsGrid'
import BookingCardFooter from './bookingCard/BookingCardFooter'
import BookingCardGuest from './bookingCard/BookingCardGuest'
import BookingCardHeader from './bookingCard/BookingCardHeader'
import BookingCardMenu from './bookingCard/BookingCardMenu'
import {
  getHostTimelineLabel,
  getHostTimelineStatus,
  timelineBadgeClasses,
} from '../utils/bookingFormatters'

export default function BookingCard({
  booking,
  actionLoadingId,
  cancelReason,
  setCancelReason,
  handleConfirm,
  handleCancel,
  handleDelete,
  canDelete,
}) {
  const isProcessing = actionLoadingId === booking.id
  const isCancelled = booking.status === 'cancelled'
  const { revealed, toggle, hide, bind } = useLongPressReveal()
  const timelineStatus = getHostTimelineStatus(booking)
  const hasActions = Boolean(booking.can_confirm || booking.can_cancel)

  return (
    <article
      {...bind}
      className={`relative overflow-hidden rounded-[26px] border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isCancelled
          ? 'border-red-200'
          : booking.status === 'pending'
            ? 'border-amber-200'
            : 'border-slate-200'
      }`}
    >
      <BookingCardMenu
        canDelete={canDelete}
        revealed={revealed}
        isProcessing={isProcessing}
        booking={booking}
        handleDelete={handleDelete}
        toggle={toggle}
        hide={hide}
      />

      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative min-h-[220px] bg-slate-100 lg:min-h-full">
          {booking.boat_image ? (
            <img
              src={booking.boat_image}
              alt={booking.boat_title || 'Boat'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center text-slate-400">
              <LifebuoyIcon className="h-10 w-10" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${timelineBadgeClasses(
                timelineStatus
              )}`}
            >
              {getHostTimelineLabel(timelineStatus)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
              Booking #{booking.id}
            </p>
            <h2 className="mt-1 line-clamp-2 text-xl font-extrabold tracking-tight">
              {booking.boat_title || 'Boat'}
            </h2>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-medium text-white/85">
              <CalendarDaysIcon className="h-4 w-4" />
              Host booking
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 p-4 md:p-5">
          <BookingCardHeader booking={booking} />

          <BookingCardGuest booking={booking} />

          <BookingCardDetailsGrid booking={booking} />

          {hasActions ? (
            <BookingCardActionPanel
              booking={booking}
              isProcessing={isProcessing}
              cancelReason={cancelReason}
              setCancelReason={setCancelReason}
              handleConfirm={handleConfirm}
              handleCancel={handleCancel}
            />
          ) : null}

          <BookingCardCancellationNotice booking={booking} />

          {revealed && canDelete ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Delete is available because this booking is cancelled or already finished.
            </div>
          ) : null}

          <BookingCardFooter
            booking={booking}
            canDelete={canDelete}
            isProcessing={isProcessing}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </article>
  )
}