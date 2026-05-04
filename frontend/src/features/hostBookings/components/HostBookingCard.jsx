import { getHostTimelineStatus } from '../utils/hostBookingFormatters'
import HostBookingActionNotice from './hostBookingCard/HostBookingActionNotice'
import HostBookingActions from './hostBookingCard/HostBookingActions'
import HostBookingCancellationSection from './hostBookingCard/HostBookingCancellationSection'
import HostBookingImagePanel from './hostBookingCard/HostBookingImagePanel'
import HostBookingInfoGrid from './hostBookingCard/HostBookingInfoGrid'
import HostBookingSummary from './hostBookingCard/HostBookingSummary'
import {
  getBoatId,
  getCancelReasonValue,
  getHostBookingCardState,
} from './hostBookingCard/hostBookingCardUtils'

export default function HostBookingCard({
  booking,
  actionLoadingId,
  cancelReason,
  setCancelReason,
  onCancel,
  onConfirm,
  onDelete,
  canDeleteBooking,
}) {
  const timelineStatus = getHostTimelineStatus(booking)
  const boatId = getBoatId(booking)
  const messageLink = booking.conversation_id
    ? `/messages/${booking.conversation_id}`
    : '/messages'

  const {
    isCancelled,
    isPending,
    displayStatus,
    isActionLoading,
    canConfirm,
    canCancel,
    canDelete,
  } = getHostBookingCardState({
    booking,
    timelineStatus,
    actionLoadingId,
    canDeleteBooking,
  })

  const reasonValue = getCancelReasonValue(cancelReason, booking.id)

  const handleReasonChange = (value) => {
    if (!setCancelReason) return

    setCancelReason((current) => {
      if (current && typeof current === 'object' && !Array.isArray(current)) {
        return { ...current, [booking.id]: value }
      }

      return value
    })
  }

  return (
    <article
      className={`overflow-hidden rounded-[30px] border bg-[#071d32] text-white shadow-soft transition hover:-translate-y-0.5 ${
        isCancelled
          ? 'border-red-400/40'
          : isPending
            ? 'border-gold/50'
            : 'border-white/15'
      }`}
    >
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <HostBookingImagePanel booking={booking} timelineStatus={timelineStatus} />

        <div className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
          <HostBookingSummary
            booking={booking}
            displayStatus={displayStatus}
            isPending={isPending}
          />

          <HostBookingInfoGrid
            booking={booking}
            timelineStatus={timelineStatus}
          />

          <HostBookingActionNotice isPending={isPending} />

          <HostBookingCancellationSection
            booking={booking}
            canCancel={canCancel}
            isCancelled={isCancelled}
            reasonValue={reasonValue}
            onReasonChange={handleReasonChange}
          />

          <HostBookingActions
            booking={booking}
            boatId={boatId}
            messageLink={messageLink}
            isActionLoading={isActionLoading}
            canConfirm={canConfirm}
            canCancel={canCancel}
            isCancelled={isCancelled}
            canDelete={canDelete}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  )
}