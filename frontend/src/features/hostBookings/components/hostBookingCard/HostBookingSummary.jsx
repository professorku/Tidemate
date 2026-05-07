import { Link } from 'react-router-dom'
import {
  LifebuoyIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  formatBoatType,
  formatStatusLabel,
  hostStatusClasses,
} from '../../utils/hostBookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../../utils/locationPrivacy'
import { getRenterId } from './hostBookingCardUtils'

export default function HostBookingSummary({
  booking,
  displayStatus,
  isPending,
}) {
  const renterId = getRenterId(booking)
  const renterDisplayName =
    booking.renter_display_name ||
    booking.renter_username ||
    booking.user_username ||
    'Renter'

  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location not set')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')
  const guestsLabel = booking.boat_guests
    ? `Up to ${booking.boat_guests} guests`
    : 'Guests not set'

  return (
    <div className="pr-2">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${hostStatusClasses(
            displayStatus
          )}`}
        >
          {formatStatusLabel(displayStatus)}
        </span>

        {hasExactLocation ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/40">
            Exact pickup visible
          </span>
        ) : null}

        {isPending ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-gold/40">
            Needs your response
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white">
        {booking.boat_title || 'Boat'}
      </h3>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/65">
        <span className="inline-flex items-center gap-1.5">
          <MapPinIcon className="h-4 w-4 text-gold" />
          {locationLabel}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <LifebuoyIcon className="h-4 w-4 text-gold" />
          {formatBoatType(booking.boat_type)}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <UserGroupIcon className="h-4 w-4 text-gold" />
          {guestsLabel}
        </span>
      </div>

      {publicLocationLabel && publicLocationLabel !== locationLabel ? (
        <p className="mt-2 text-xs text-white/50">
          Public area: {publicLocationLabel}
        </p>
      ) : null}

      <p className="mt-3 text-sm text-white/65">
        Requested by{' '}
        {renterId ? (
          <Link
            to={`/users/${renterId}`}
            className="font-bold text-gold hover:underline"
          >
            {renterDisplayName}
          </Link>
        ) : (
          <span className="font-bold text-white">
            {renterDisplayName}
          </span>
        )}
      </p>
    </div>
  )
}