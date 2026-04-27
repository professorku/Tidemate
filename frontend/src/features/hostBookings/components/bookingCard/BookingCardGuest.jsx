import { Link } from 'react-router-dom'

export default function BookingCardGuest({ booking }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
        {booking.renter_avatar ? (
          <img
            src={booking.renter_avatar}
            alt={booking.renter_username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-slate-500">
            {booking.renter_username?.slice(0, 1)?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Guest</p>
        <Link
          to={`/users/${booking.renter_id || booking.renter}`}
          className="truncate text-sm font-semibold text-navy hover:underline"
        >
          {booking.renter_username}
        </Link>
      </div>
    </div>
  )
}
