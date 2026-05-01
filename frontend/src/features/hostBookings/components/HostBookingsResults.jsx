import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import BookingCard from './HostBookingCard'
import { getEmptyStateForTab } from '../utils/bookingFormatters'

export default function HostBookingsResults({
  loading,
  error,
  filteredBookings,
  actionLoadingId,
  cancelReason,
  setCancelReason,
  onConfirm,
  onCancel,
  onDelete,
  canDeleteBooking,
  onRetry,
  activeTab,
}) {
  if (loading) {
    return (
      <LoadingState
        icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
        title="Loading host bookings"
        text="We are gathering incoming requests, confirmed trips, and cancellations."
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load host bookings"
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (!filteredBookings.length) {
    const emptyState = getEmptyStateForTab(activeTab)

    return (
      <EmptyState
        icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
        title={emptyState.title}
        text={emptyState.text}
        actionLabel="Go to my boats"
        actionTo="/my-boats"
        compact={false}
      />
    )
  }

  return (
    <div className="space-y-5">
      {filteredBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          actionLoadingId={actionLoadingId}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          handleConfirm={onConfirm}
          handleCancel={onCancel}
          handleDelete={onDelete}
          canDelete={canDeleteBooking(booking)}
        />
      ))}
    </div>
  )
} 