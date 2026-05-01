import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  LifebuoyIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import HostBookingCard from './HostBookingCard'

const EMPTY_STATE_CONTENT = {
  all: {
    title: 'No host bookings yet',
    text: 'When renters request your boats, the booking requests will appear here.',
  },
  pending: {
    title: 'No pending requests',
    text: 'New renter requests waiting for your approval will show up here.',
  },
  confirmed: {
    title: 'No confirmed bookings',
    text: 'Accepted rental trips will appear here after you confirm requests.',
  },
  cancelled: {
    title: 'No cancelled bookings',
    text: 'Cancelled host bookings will appear here if you have any.',
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

export default function HostBookingsResults({
  loading,
  error,
  filteredBookings,
  activeTab,
  actionLoadingId,
  cancelReason,
  setCancelReason,
  onCancel,
  onConfirm,
  onDelete,
  canDeleteBooking,
  onRetry,
}) {
  if (loading) {
    return (
      <PanelState
        icon={<CalendarDaysIcon className="h-8 w-8 animate-pulse" />}
        title="Loading host bookings"
        text="We are fetching booking requests, confirmed trips, and cancellations."
      />
    )
  }

  if (error) {
    return (
      <PanelState
        icon={<ExclamationTriangleIcon className="h-8 w-8" />}
        title="Could not load host bookings"
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
        icon={<LifebuoyIcon className="h-8 w-8" />}
        title={state.title}
        text={state.text}
      >
        <Link
          to="/my-boats"
          className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          Manage boats
        </Link>
      </PanelState>
    )
  }

  return (
    <div className="space-y-5">
      {filteredBookings.map((booking) => (
        <HostBookingCard
          key={booking.id}
          booking={booking}
          actionLoadingId={actionLoadingId}
          cancelReason={cancelReason}
          setCancelReason={setCancelReason}
          onCancel={onCancel}
          onConfirm={onConfirm}
          onDelete={onDelete}
          canDeleteBooking={canDeleteBooking}
        />
      ))}
    </div>
  )
}