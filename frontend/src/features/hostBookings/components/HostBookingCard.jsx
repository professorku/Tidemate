import BaseBookingCard from '../../../components/bookings/BaseBookingCard'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import BookingCardActionPanel from './bookingCard/BookingCardActionPanel'
import BookingCardCancellationNotice from './bookingCard/BookingCardCancellationNotice'
import BookingCardDetailsGrid from './bookingCard/BookingCardDetailsGrid'
import BookingCardFooter from './bookingCard/BookingCardFooter'
import BookingCardGuest from './bookingCard/BookingCardGuest'
import BookingCardHeader from './bookingCard/BookingCardHeader'
import BookingCardMenu from './bookingCard/BookingCardMenu'

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

  return (
    <BaseBookingCard
      bind={bind}
      menu={(
        <BookingCardMenu
          canDelete={canDelete}
          revealed={revealed}
          isProcessing={isProcessing}
          booking={booking}
          handleDelete={handleDelete}
          toggle={toggle}
          hide={hide}
        />
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <BookingCardHeader booking={booking} isCancelled={isCancelled} />
          <BookingCardGuest booking={booking} />
          <BookingCardDetailsGrid booking={booking} />

          {revealed && canDelete ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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

        <BookingCardActionPanel
          booking={booking}
          isProcessing={isProcessing}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          handleConfirm={handleConfirm}
          handleCancel={handleCancel}
        />
      </div>

      <BookingCardCancellationNotice booking={booking} />
    </BaseBookingCard>
  )
}
