import ReviewForm from '../../../components/ReviewForm'
import { formatDate } from '../../../utils/format/date'

export default function PublicProfileReviewSection({ reviewableBookings, reloadPage }) {
  if (!reviewableBookings.length) {
    return null
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Review</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Leave a review</h2>
        <p className="mt-2 text-slate-600">
          You can review this host after a completed booking.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        {reviewableBookings.map((booking) => (
          <div
            key={booking.booking_id}
            className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 md:p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">{booking.boat_title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(booking.start_date)} – {formatDate(booking.end_date)}
                </p>
              </div>

              {booking.boat_image ? (
                <img
                  src={booking.boat_image}
                  alt={booking.boat_title}
                  className="h-20 w-28 rounded-2xl object-cover"
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
