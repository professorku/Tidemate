import InfoCard from './InfoCard'
import BookingLocationMap from './BookingLocationMap'
import {
  formatBookingWindow,
  formatBoatType,
} from '../utils/bookingFormatters'

export default function TripDetailsCard({ booking }) {
  const bookingWindow = formatBookingWindow(booking)
  const hasExactLocation =
    Boolean(booking?.exact_location_available) || booking?.location_precision === 'exact'

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-xl font-bold text-slate-900">Trip details</h2>

      <div className="mt-3 rounded-2xl bg-mist px-4 py-3 text-sm text-slate-700">
        <span className="font-semibold text-slate-900">Rental period policy:</span>{' '}
        {booking?.rental_policy?.display_text ||
          'Pickup from 15:00 on the first day. Return by 12:00 on the last day.'}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <InfoCard label="Pickup" value={bookingWindow.pickup} />
        <InfoCard label="Return" value={bookingWindow.return} />
        <InfoCard
          label="Duration"
          value={`${booking.duration_days} day${booking.duration_days !== 1 ? 's' : ''}`}
        />
        <InfoCard
          label="Boat details"
          value={`${formatBoatType(booking.boat_type)} · ${booking.boat_guests} guests`}
        />
        <InfoCard label="Price per day" value={`${booking.price_per_day} kr`} />
        <InfoCard label="Total price" value={`${booking.total_price} kr`} />
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-bold text-slate-900">
          {hasExactLocation ? 'Exact pickup location' : 'Where your trip takes place'}
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          {booking?.location_disclosure_message ||
            (hasExactLocation
              ? 'See the exact pickup point before your trip starts.'
              : 'The exact pickup point is shared after the booking is confirmed.')}
        </p>

        {hasExactLocation && (booking?.pickup_address || booking?.pickup_instructions) ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {booking?.pickup_address ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Private pickup address
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {booking.pickup_address}
                </p>
              </div>
            ) : null}

            {booking?.pickup_instructions ? (
              <div className={booking?.pickup_address ? 'mt-4' : ''}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pickup instructions
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {booking.pickup_instructions}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-2xl">
          <BookingLocationMap
            locationName={booking.boat_location}
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
  )
}