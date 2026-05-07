import { Link } from 'react-router-dom'
import {
  LifebuoyIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  formatBoatType,
  formatStatusLabel,
  statusClasses,
} from '../utils/bookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

export default function BookingCardHeader({ booking, timelineStatus }) {
  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location not set')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')

  const hostDisplayName =
    booking.host_display_name ||
    booking.host_username ||
    'Host'

  return (
    <div className="pr-12">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(
            booking.status
          )}`}
        >
          {formatStatusLabel(booking.status)}
        </span>

        {hasExactLocation ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/40">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Exact pickup visible
          </span>
        ) : null}

        {timelineStatus === 'pending' ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/40">
            Host needs to approve
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 line-clamp-2 text-xl font-extrabold leading-tight tracking-tight text-white md:text-2xl">
        {booking.boat_title || 'Boat'}
      </h3>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/65">
        <span className="inline-flex items-center gap-1.5">
          <MapPinIcon className="h-4 w-4 text-gold" />
          {locationLabel}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <LifebuoyIcon className="h-4 w-4 text-gold" />
          {formatBoatType(booking.boat_type)}
        </span>

        {booking.boat_guests ? (
          <span className="inline-flex items-center gap-1.5">
            <UserGroupIcon className="h-4 w-4 text-gold" />
            Up to {booking.boat_guests} guests
          </span>
        ) : null}
      </div>

      {hasExactLocation && publicLocationLabel && publicLocationLabel !== locationLabel ? (
        <p className="mt-2 text-xs text-white/50">
          Public area: {publicLocationLabel}
        </p>
      ) : null}

      <p className="mt-2 text-sm text-white/65">
        Hosted by{' '}
        {booking.host_id ? (
          <Link
            to={`/users/${booking.host_id}`}
            className="font-bold text-gold hover:underline"
          >
            {hostDisplayName}
          </Link>
        ) : (
          <span className="font-bold text-white">
            {hostDisplayName}
          </span>
        )}
      </p>
    </div>
  )
}