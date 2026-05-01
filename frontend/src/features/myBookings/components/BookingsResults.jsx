import { Link } from 'react-router-dom'
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import BookingCard from './MyBookingCard'

const EMPTY_STATE_CONTENT = {
  all: {
    title: 'No bookings yet',
    text: 'Browse boats and request your first trip when you find one you like.',
  },
  upcoming: {
    title: 'No upcoming trips',
    text: 'Confirmed future bookings will appear here.',
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

function PanelState({ icon, title, text, children }) {
  return (
    <div className="rounded-[30px] border border-white/15 bg-[#071d32] px-6 py-10 text-center text-white shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
        {icon}
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-tight text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
        {text}
      </p>

      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
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
      <PanelState
        icon={<ArrowPathIcon className="h-8 w-8 animate-spin" />}
        title="Loading your bookings"
        text="We are sorting your trips, pending requests, and past bookings."
      />
    )
  }

  if (error) {
    return (
      <PanelState
        icon={<ExclamationTriangleIcon className="h-8 w-8" />}
        title="Could not load your bookings"
        text={error}
      >
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          Try again
        </button>
      </PanelState>
    )
  }

  if (!filteredBookings.length) {
    const state = EMPTY_STATE_CONTENT[activeTab] || EMPTY_STATE_CONTENT.all

    return (
      <PanelState
        icon={<CalendarDaysIcon className="h-8 w-8" />}
        title={state.title}
        text={state.text}
      >
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          Browse boats
        </Link>
      </PanelState>
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