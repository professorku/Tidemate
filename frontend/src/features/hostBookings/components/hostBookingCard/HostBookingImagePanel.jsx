import { LifebuoyIcon } from '@heroicons/react/24/outline'
import {
  getHostDateHint,
  getHostTimelineLabel,
  hostTimelineBadgeClasses,
} from '../../utils/hostBookingFormatters'
import { getBookingReference } from '../../../../utils/bookingReference'

export default function HostBookingImagePanel({ booking, timelineStatus }) {
  return (
    <div className="relative min-h-[250px] bg-navy">
      {(booking.boat_thumbnail || booking.boat_image) ? (
        <img
          src={booking.boat_thumbnail || booking.boat_image}
          alt={booking.boat_title || 'Boat'}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[250px] items-center justify-center text-gold">
          <LifebuoyIcon className="h-12 w-12" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${hostTimelineBadgeClasses(
            timelineStatus
          )}`}
        >
          {getHostTimelineLabel(timelineStatus)}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
          Host booking {getBookingReference(booking)}
        </p>

        <h2 className="mt-1 line-clamp-2 text-2xl font-extrabold tracking-tight">
          {booking.boat_title || 'Boat'}
        </h2>

        <p className="mt-2 text-sm font-medium text-white/80">
          {getHostDateHint(booking, timelineStatus)}
        </p>
      </div>
    </div>
  )
}