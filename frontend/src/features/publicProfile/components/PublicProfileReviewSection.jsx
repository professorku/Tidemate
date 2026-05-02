import ReviewForm from '../../../components/ReviewForm'
import { formatDate } from '../../../utils/format/date'

export default function PublicProfileReviewSection({ reviewableBookings, reloadPage }) {
  if (!reviewableBookings.length) {
    return null
  }

  return (
    <section className="rounded-[32px] border border-white/15 bg-navy p-6 text-white shadow-soft md:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
          Review
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
          Leave a review
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/65 md:text-base">
          You can review this host after a completed booking.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {reviewableBookings.map((booking) => (
          <div
            key={booking.booking_id}
            className="rounded-[28px] border border-white/15 bg-white/10 p-5 md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-extrabold text-white">
                  {booking.boat_title}
                </p>

                <p className="mt-1 text-sm text-white/60">
                  {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                </p>
              </div>

              {booking.boat_image ? (
                <img
                  src={booking.boat_image}
                  alt={booking.boat_title}
                  className="h-20 w-28 rounded-2xl object-cover ring-1 ring-white/15"
                />
              ) : null}
            </div>

            <div className="mt-5">
              <ReviewForm
                bookingId={booking.booking_id}
                reviewType="user"
                onReviewCreated={() => reloadPage({ silent: true })}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}