import { useEffect, useMemo, useState } from 'react'
import ReviewForm from './ReviewForm'
import { useReviewableBookings } from '../hooks/useReviewableBookings'
import { formatDateRange } from '../utils/format/date'

export default function ReviewBookings() {
  const { reviewableBookings, refreshReviewableBookings } = useReviewableBookings()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true)
        await refreshReviewableBookings()
      } catch (err) {
        console.error('Failed to load reviewable bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [refreshReviewableBookings])

  const visibleBookings = useMemo(() => {
    return reviewableBookings.filter((booking) => booking.can_review_user)
  }, [reviewableBookings])

  if (loading) {
    return (
      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-bold text-slate-900">Leave a user review</h2>
        <p className="mt-4 text-slate-600">Loading completed trips...</p>
      </section>
    )
  }

  if (visibleBookings.length === 0) {
    return null
  }

  return (
    <section className="rounded-[28px] bg-white p-6 shadow-soft md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave a user review</h2>
          <p className="mt-2 text-slate-600">
            Share feedback about the other person after completed trips.
          </p>
        </div>

        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
          Completed trip
        </span>
      </div>

      <div className="mt-6 space-y-6">
        {visibleBookings.map((booking) => (
          <div
            key={booking.booking_id}
            className="rounded-[24px] border border-slate-200 p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900">
                  {booking.boat_title}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatDateRange(booking.start_date, booking.end_date)}
                </p>

                <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  Completed trip · Leave user review
                </p>

                <p className="mt-3 text-slate-600">
                  Review {booking.target_role}:{' '}
                  <span className="font-semibold text-slate-900">
                    {booking.target_username}
                  </span>
                </p>
              </div>

              {booking.boat_image ? (
                <img
                  src={booking.boat_image}
                  alt={booking.boat_title}
                  className="h-24 w-32 rounded-2xl object-cover"
                />
              ) : null}
            </div>

            <div className="mt-5">
              <ReviewForm
                bookingId={booking.booking_id}
                reviewType="user"
                onReviewCreated={refreshReviewableBookings}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
