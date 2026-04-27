import { Link } from 'react-router-dom'
import BookingCardImageThumb from '../../../components/bookings/BookingCardImageThumb'
import {
  getTimelineLabel,
  statusClasses,
  timelineBadgeClasses,
} from '../utils/bookingFormatters'

export default function BookingCardHeader({ booking, timelineStatus, isCancelled, isCompleted }) {
  return (
    <div className="flex items-start justify-between gap-4 pr-14">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${timelineBadgeClasses(
              timelineStatus
            )}`}
          >
            {getTimelineLabel(timelineStatus)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>

        <h2 className="mt-2 text-lg font-bold text-slate-900 md:text-xl">
          {booking.boat_title || 'Boat'}
        </h2>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-slate-600">
          <span>{booking.boat_location || 'Location not set'}</span>
          {booking.boat_type ? <span>{booking.boat_type}</span> : null}
          {booking.boat_guests ? <span>Up to {booking.boat_guests} guests</span> : null}
        </div>

        <p className="mt-2.5 text-sm text-slate-600">
          Hosted by{' '}
          {booking.host_id ? (
            <Link
              to={`/users/${booking.host_id}`}
              className="font-semibold text-slate-800 hover:underline"
            >
              {booking.host_username || 'Host'}
            </Link>
          ) : (
            <span className="font-semibold text-slate-800">
              {booking.host_username || 'Host'}
            </span>
          )}
        </p>
      </div>

      <BookingCardImageThumb
        image={booking.boat_image}
        alt={booking.boat_title}
        overlay={(
          <>
            {isCancelled ? <div className="absolute inset-0 bg-red-500/30" /> : null}
            {isCompleted ? <div className="absolute inset-0 bg-green-500/30" /> : null}
          </>
        )}
      />
    </div>
  )
}
