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
      {!last ? <div className="absolute left-[15px] top-8 h-full w-px bg-slate-200" /> : null}

      <div
        className={`relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
          active ? 'bg-gold text-navy' : 'bg-slate-200 text-slate-500'
        }`}
      >
        <ClockIcon className="h-4 w-4" />
      </div>

      <div className="pb-5">
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  )
}

export default function TripDetailsCard({ booking }) {
  const bookingWindow = formatBookingWindow(booking)
  const hasExactLocation =
    Boolean(booking?.exact_location_available) || booking?.location_precision === 'exact'

  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
              Trip overview
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              Dates, boat, and pickup
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Keep this page handy before the trip. It contains the rental window,
              pricing, boat capacity, and pickup information.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-navy ring-1 ring-slate-200">
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

        <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mist text-navy">
              <SparklesIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Rental period policy</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {booking?.rental_policy?.display_text ||
                  'Pickup from 15:00 on the first day. Return by 12:00 on the last day.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-extrabold text-slate-900">Trip timeline</h3>

            <div className="mt-5">
              <TimelineStep
                title="Request sent"
                text="The booking request was created and saved in your account."
                active
              />
              <TimelineStep
                title="Host confirmation"
                text={
                  booking.status === 'pending'
                    ? 'Waiting for the host to confirm this request.'
                    : booking.status === 'cancelled'
                      ? 'This booking was cancelled before or after confirmation.'
                      : 'The booking has been confirmed.'
                }
                active={booking.status === 'confirmed'}
              />
              <TimelineStep
                title="Pickup and return"
                text={`${bookingWindow.pickup} → ${bookingWindow.return}`}
                active={booking.status === 'confirmed'}
                last
              />
            </div>
          </div>

          <div>
            <div className="mb-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
                  <MapPinIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {hasExactLocation ? 'Exact pickup location' : 'Trip area'}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {booking?.location_disclosure_message ||
                      (hasExactLocation
                        ? 'See the exact pickup point before your trip starts.'
                        : 'The exact pickup point is shared after the booking is confirmed.')}
                  </p>
                </div>
              </div>
            </div>

            {hasExactLocation && (booking?.pickup_address || booking?.pickup_instructions) ? (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                {booking?.pickup_address ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Private pickup address
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {booking.pickup_address}
                    </p>
                  </div>
                ) : null}

                {booking?.pickup_instructions ? (
                  <div className={booking?.pickup_address ? 'mt-4' : ''}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Pickup instructions
                    </p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                      {booking.pickup_instructions}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

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
  )
}