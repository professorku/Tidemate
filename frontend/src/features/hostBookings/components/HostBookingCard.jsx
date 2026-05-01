import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  LifebuoyIcon,
  MapPinIcon,
  TrashIcon,
  UserCircleIcon,
  UserGroupIcon,
  WalletIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import {
  formatBoatType,
  formatBookingWindow,
  formatMoney,
  formatStatusLabel,
  getHostDateHint,
  getHostTimelineLabel,
  getHostTimelineStatus,
  hostStatusClasses,
  hostTimelineBadgeClasses,
} from '../utils/hostBookingFormatters'
import {
  canShowExactLocation,
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

function getBoatId(booking) {
  return booking.boat || booking.boat_id || booking.boat_uuid
}

function getRenterId(booking) {
  return booking.renter || booking.renter_id || booking.user || booking.user_id
}

function getCancelReasonValue(cancelReason, bookingId) {
  if (!cancelReason) return ''
  if (typeof cancelReason === 'string') return cancelReason
  return cancelReason?.[bookingId] || ''
}

function InfoTile({ icon, label, value, subtext }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
          {icon}
        </div>

        <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
          {label}
        </p>
      </div>

      <p className="mt-3 text-sm font-bold leading-6 text-white">{value}</p>

      {subtext ? (
        <p className="mt-1 text-[11px] font-medium text-white/55">{subtext}</p>
      ) : null}
    </div>
  )
}

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
  const bookingWindow = formatBookingWindow(booking)
  const boatId = getBoatId(booking)
  const renterId = getRenterId(booking)
  const messageLink = booking.conversation_id
    ? `/messages/${booking.conversation_id}`
    : '/messages'

  const hasExactLocation = canShowExactLocation(booking)
  const locationLabel = getBoatLocationLabel(booking, 'Location not set')
  const publicLocationLabel = getBoatPublicLocationLabel(booking, '')
  const guestsLabel = booking.boat_guests
    ? `Up to ${booking.boat_guests} guests`
    : 'Guests not set'

  const isPending = booking.status === 'pending' || timelineStatus === 'pending'
  const isCancelled = booking.status === 'cancelled' || timelineStatus === 'cancelled'
  const isConfirmed = booking.status === 'confirmed'
  const isActionLoading = actionLoadingId === booking.id

  const canConfirm = Boolean(booking.can_confirm ?? isPending)
  const canCancel = Boolean(
    booking.can_cancel ?? (!isCancelled && timelineStatus !== 'completed')
  )
  const canDelete = canDeleteBooking ? canDeleteBooking(booking) : isCancelled

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
        <div className="relative min-h-[250px] bg-navy">
          {booking.boat_image ? (
            <img
              src={booking.boat_image}
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
              Host booking #{booking.id}
            </p>

            <h2 className="mt-1 line-clamp-2 text-2xl font-extrabold tracking-tight">
              {booking.boat_title || 'Boat'}
            </h2>

            <p className="mt-2 text-sm font-medium text-white/80">
              {getHostDateHint(booking, timelineStatus)}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
          <div className="pr-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${hostStatusClasses(
                  booking.status
                )}`}
              >
                {formatStatusLabel(booking.status)}
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
                  {booking.renter_username || booking.user_username || 'Renter'}
                </Link>
              ) : (
                <span className="font-bold text-white">
                  {booking.renter_username || booking.user_username || 'Renter'}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Pickup"
              value={bookingWindow.pickup}
            />

            <InfoTile
              icon={<CalendarDaysIcon className="h-4 w-4" />}
              label="Return"
              value={bookingWindow.return}
            />

            <InfoTile
              icon={<ClockIcon className="h-4 w-4" />}
              label="Trip status"
              value={getHostDateHint(booking, timelineStatus)}
            />

            <InfoTile
              icon={<WalletIcon className="h-4 w-4" />}
              label="Total price"
              value={formatMoney(booking.total_price)}
              subtext={
                booking.duration_days
                  ? `${booking.duration_days} day${booking.duration_days === 1 ? '' : 's'}`
                  : undefined
              }
            />
          </div>

          {isPending ? (
            <div className="rounded-2xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-white">
              <span className="font-semibold text-gold">Action needed:</span> Confirm
              the booking if the boat is available, or cancel the request if it cannot
              be hosted.
            </div>
          ) : null}

          {canCancel && !isCancelled ? (
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
              <label
                htmlFor={`cancel-reason-${booking.id}`}
                className="text-xs font-extrabold uppercase tracking-wide text-gold"
              >
                Optional cancellation reason
              </label>

              <textarea
                id={`cancel-reason-${booking.id}`}
                value={reasonValue}
                onChange={(e) => handleReasonChange(e.target.value)}
                placeholder="Example: The boat is unavailable on these dates."
                className="mt-3 min-h-[86px] w-full resize-none rounded-2xl border border-white/15 bg-[#071d32] p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
              />
            </div>
          ) : null}

          {booking.cancellation_reason ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-200">
                Cancellation reason
              </p>

              <p className="mt-1 text-sm leading-6 text-red-100">
                {booking.cancellation_reason}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
            <Link
              to={`/bookings/${booking.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
            >
              <EyeIcon className="h-4 w-4" />
              View booking
            </Link>

            {boatId ? (
              <Link
                to={`/boats/${boatId}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
              >
                <LifebuoyIcon className="h-4 w-4" />
                View boat
              </Link>
            ) : null}

            <Link
              to={messageLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Messages
            </Link>

            {canConfirm ? (
              <button
                type="button"
                onClick={() => onConfirm(booking)}
                disabled={isActionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircleIcon className="h-4 w-4" />
                {isActionLoading ? 'Confirming...' : 'Confirm'}
              </button>
            ) : null}

            {canCancel && !isCancelled ? (
              <button
                type="button"
                onClick={() => onCancel(booking)}
                disabled={isActionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircleIcon className="h-4 w-4" />
                {isActionLoading ? 'Cancelling...' : 'Cancel'}
              </button>
            ) : null}

            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete(booking)}
                disabled={isActionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
                {isActionLoading ? 'Deleting...' : 'Delete'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}