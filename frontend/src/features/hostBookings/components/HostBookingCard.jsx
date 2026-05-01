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

  return (
    <article
      {...bind}
      className={`relative overflow-hidden rounded-[30px] border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${
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

      <div className="grid gap-0 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <div className="relative min-h-[240px] bg-slate-100">
          {booking.boat_image ? (
            <img
              src={booking.boat_image}
              alt={booking.boat_title || 'Boat'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center text-slate-400">
              <LifebuoyIcon className="h-12 w-12" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${timelineBadgeClasses(
                timelineStatus
              )}`}
            >
              {getHostTimelineLabel(timelineStatus)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
              Booking #{booking.id}
            </p>
            <h2 className="mt-1 line-clamp-2 text-2xl font-extrabold tracking-tight">
              {booking.boat_title || 'Boat'}
            </h2>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white/85">
              <CalendarDaysIcon className="h-4 w-4" />
              Host booking request
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
          <BookingCardHeader booking={booking} isCancelled={isCancelled} />

          <BookingCardGuest booking={booking} />

          <BookingCardDetailsGrid booking={booking} />

          {revealed && canDelete ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Delete is available because this booking is cancelled or already finished.
            </div>
          ) : null}

          <BookingCardCancellationNotice booking={booking} />

          <BookingCardFooter
            booking={booking}
            canDelete={canDelete}
            isProcessing={isProcessing}
            handleDelete={handleDelete}
          />
        </div>

        <BookingCardActionPanel
          booking={booking}
          isProcessing={isProcessing}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
        />
      </div>
    </article>
  )
}