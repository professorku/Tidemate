import InfoCard from './InfoCard'
import BookingLocationMap from './BookingLocationMap'
import {
  formatBookingWindow,
  formatBoatType,
} from '../utils/bookingFormatters'

export default function TripDetailsCard({ booking }) {
  const bookingWindow = formatBookingWindow(booking)

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
          Where your trip takes place
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          See where the boat is located before your trip starts.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl">
          <BookingLocationMap
            locationName={booking.boat_location}
            latitude={booking.latitude}
            longitude={booking.longitude}
          />
        </div>
      </div>
    </div>
  )
}