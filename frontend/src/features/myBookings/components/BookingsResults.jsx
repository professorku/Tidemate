import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import BookingCard from './MyBookingCard'

const EMPTY_STATE_CONTENT = {
  all: {
    title: 'No bookings yet',
    text: 'Browse boats and request your first trip when you find one you like.',
  },
  upcoming: {
    title: 'No upcoming trips',
    text: 'Once a booking gets confirmed for future dates, it will appear here.',
  },
  active: {
    title: 'No active trips right now',
    text: 'Bookings that are currently in progress will show up here.',
  },
  pending: {
    title: 'No pending requests',
    text: 'Booking requests waiting for host approval will appear here.',
  },
  completed: {
    title: 'No completed trips yet',
    text: 'After a booking finishes, it will move here.',
  },
  cancelled: {
    title: 'No cancelled bookings',
    text: 'Cancelled reservations will appear here if you have any.',
  },
}

export default function BookingsResults({
  loading,
  error,
  filteredBookings,
  activeTab,
  cancellingId,
  deletingId,
  onCancel,
  onDelete,
  onRetry,
  onRefresh,
}) {
  if (loading) {
    return (
      <LoadingState
        icon={<CalendarDaysIcon className="h-8 w-8" />}
        title="Loading your bookings"
        text="We are sorting your trips, pending requests, and past bookings."
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load your bookings"
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (!filteredBookings.length) {
    const state = EMPTY_STATE_CONTENT[activeTab] || EMPTY_STATE_CONTENT.all

    return (
      <EmptyState
        icon={<CalendarDaysIcon className="h-8 w-8" />}
        title={state.title}
        text={state.text}
        actionLabel="Browse boats"
        actionTo="/"
        compact
      />
    )
  }

  return (
    <div className="space-y-5">
      {filteredBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          cancellingId={cancellingId}
          deletingId={deletingId}
          onCancel={onCancel}
          onDelete={onDelete}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  )
}
