import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  UserGroupIcon,
  WalletIcon,
} from '@heroicons/react/24/outline'
import InfoCard from './InfoCard'
import BookingLocationMap from './BookingLocationMap'
import {
  formatBookingWindow,
  formatBoatType,
  formatMoney,
} from '../utils/bookingFormatters'

function TimelineStep({ title, text, active = false, last = false }) {
  return (
    <div className="relative flex gap-3">
      {!last ? (
        <div className="absolute left-[15px] top-8 h-full w-px bg-gold/15" />
      ) : null}

      <div
        className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-navy ${
          active ? 'bg-gold text-navy' : 'bg-white/10 text-white/45'
        }`}
      >
        <ClockIcon className="h-4 w-4" />
      </div>

      <div className="pb-5">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/60">{text}</p>
      </div>
    </div>
  )
}

function getTimelineState(booking) {
  const lifecycleStage = booking?.lifecycle_stage
  const status = booking?.status

  const isCancelled = status === 'cancelled'
  const isAwaitingPayment = status === 'awaiting_payment'
  const isConfirmed = status === 'confirmed'
  const isActiveTrip = lifecycleStage === 'active'
  const isCompletedTrip =
    lifecycleStage === 'completed' || Boolean(booking?.trip_finished)

  return {
    requestSent: true,
    hostConfirmed:
      isAwaitingPayment || isConfirmed || isActiveTrip || isCompletedTrip,
    paymentStep:
      isAwaitingPayment || isConfirmed || isActiveTrip || isCompletedTrip,
    pickupReached: isActiveTrip || isCompletedTrip,
    returnReached: isCompletedTrip,
    isCancelled,
  }
}

function getHostConfirmationText(booking) {
  if (booking.status === 'pending') {
    return 'Waiting for the host to confirm this request.'
  }

  if (booking.status === 'awaiting_payment') {
    return 'The host has confirmed your booking request.'
  }

  if (booking.status === 'cancelled') {
    return 'This booking was cancelled before or after confirmation.'
  }

  return 'The booking has been confirmed.'
}

function getPaymentText(booking) {
  if (booking.status === 'pending') {
    return 'Payment becomes available after the host confirms the booking.'
  }

  if (booking.status === 'awaiting_payment') {
    return 'Complete the payment to secure this booking.'
  }

  if (booking.status === 'cancelled') {
    return 'Payment is no longer available because this booking was cancelled.'
  }

  return 'Payment was completed successfully and the booking is secured.'
}

function getPickupText(booking, bookingWindow) {
  if (booking.status === 'cancelled') {
    return `Pickup was planned for ${bookingWindow.pickup}.`
  }

  if (booking.lifecycle_stage === 'active') {
    return `Pickup time has started: ${bookingWindow.pickup}.`
  }

  if (booking.lifecycle_stage === 'completed' || booking.trip_finished) {
    return `Pickup was ${bookingWindow.pickup}.`
  }

  return `Pickup is scheduled for ${bookingWindow.pickup}.`
}

function getReturnText(booking, bookingWindow) {
  if (booking.status === 'cancelled') {
    return `Return was planned for ${bookingWindow.return}.`
  }

  if (booking.lifecycle_stage === 'completed' || booking.trip_finished) {
    return `Return was ${bookingWindow.return}.`
  }

  if (booking.lifecycle_stage === 'active') {
    return `Return is still due by ${bookingWindow.return}.`
  }

  return `Return is due by ${bookingWindow.return}.`
}

export default function TripDetailsCard({ booking }) {
  const bookingWindow = formatBookingWindow(booking)
  const timelineState = getTimelineState(booking)

  const hasExactLocation =
    Boolean(booking?.exact_location_available) || booking?.location_precision === 'exact'

  return (
    <div className="overflow-hidden rounded-[30px] border border-gold/20 bg-navy shadow-soft">
      <div className="border-b border-gold/10 bg-[#071d32]/70 px-5 py-5 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Trip overview
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-white">
              Dates, boat, and pickup
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              Keep this page handy before the trip. It contains the rental window,
              pricing, boat capacity, and pickup information.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/20 bg-navy px-4 py-3 text-sm font-bold text-gold">
            {booking.duration_days} day{booking.duration_days !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <InfoCard
            label="Pickup"
            value={bookingWindow.pickup}
            icon={<CalendarDaysIcon className="h-4 w-4" />}
          />

          <InfoCard
            label="Return"
            value={bookingWindow.return}
            icon={<CalendarDaysIcon className="h-4 w-4" />}
          />

          <InfoCard
            label="Boat details"
            value={`${formatBoatType(booking.boat_type)} · ${booking.boat_guests} guests`}
            icon={<UserGroupIcon className="h-4 w-4" />}
          />

          <InfoCard
            label="Total price"
            value={`${formatMoney(booking.total_price)} total`}
            icon={<WalletIcon className="h-4 w-4" />}
          />
        </div>

        <div className="mt-5 rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy text-gold ring-1 ring-gold/20">
              <SparklesIcon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold text-white">Rental period policy</p>

              <p className="mt-1 text-sm leading-6 text-white/60">
                {booking?.rental_policy?.display_text ||
                  booking?.rental_policy?.short_text ||
                  'Pickup and return times are loaded from the backend booking policy.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-5">
            <h3 className="text-lg font-extrabold text-white">Trip timeline</h3>

            <div className="mt-5">
              <TimelineStep
                title="Request sent"
                text="The booking request was created and saved in your account."
                active={timelineState.requestSent}
              />

              <TimelineStep
                title="Host confirmation"
                text={getHostConfirmationText(booking)}
                active={timelineState.hostConfirmed}
              />

              <TimelineStep
                title="Payment"
                text={getPaymentText(booking)}
                active={timelineState.paymentStep}
              />

              <TimelineStep
                title="Pickup"
                text={getPickupText(booking, bookingWindow)}
                active={timelineState.pickupReached}
              />

              <TimelineStep
                title="Return"
                text={getReturnText(booking, bookingWindow)}
                active={timelineState.returnReached}
                last
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
                  <MapPinIcon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    {hasExactLocation ? 'Pickup location' : 'Trip area'}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-white/60">
                    {booking?.location_disclosure_message ||
                      (hasExactLocation
                        ? 'See the pickup point before your trip starts.'
                        : 'The exact pickup point is shared after the booking is confirmed.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-gold/20">
              <BookingLocationMap
                locationName={booking.boat_location}
                pickupAddress={booking.pickup_address}
                pickupInstructions={booking.pickup_instructions}
                latitude={booking.latitude}
                longitude={booking.longitude}
                locationPrecision={booking.location_precision}
                locationRadiusKm={booking.location_radius_km}
                exactLocationAvailable={booking.exact_location_available}
                disclosureMessage={booking.location_disclosure_message}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}