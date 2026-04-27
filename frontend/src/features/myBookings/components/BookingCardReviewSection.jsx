import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ReviewForm from '../../../components/ReviewForm'
import { formatRatingLabel } from '../utils/bookingFormatters'

function ReviewPreviewCard({ title, review }) {
  if (!review) return null

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        {title}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-900">
        {formatRatingLabel(review.rating)} · {review.rating}/5
      </p>

      <p className="mt-2 text-sm text-slate-700">
        {review.comment_preview || 'No written comment.'}
      </p>
    </div>
  )
}

export default function BookingCardReviewSection({ booking, isCompleted, onRefresh }) {
  const [openReviewType, setOpenReviewType] = useState('')

  const reviewHeadline = useMemo(() => {
    if (booking.viewer_boat_review || booking.viewer_user_review) {
      return 'Your review'
    }

    if (booking.can_review_boat || booking.can_review_user) {
      return 'Leave review'
    }

    return ''
  }, [booking])

  const handleReviewCreated = async () => {
    setOpenReviewType('')
    if (onRefresh) {
      await onRefresh()
    }
  }

  if (!isCompleted) return null

  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Post-trip
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900">
            {reviewHeadline || 'Completed trip'}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            This trip is finished. You can review the experience or book the boat again.
          </p>
        </div>

        <Link
          to={`/boats/${booking.boat}`}
          className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Book again
        </Link>
      </div>

      {booking.viewer_boat_review || booking.viewer_user_review ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <ReviewPreviewCard
            title="Your boat review"
            review={booking.viewer_boat_review}
          />
          <ReviewPreviewCard
            title={`Your ${booking.review_target_role || 'host'} review`}
            review={booking.viewer_user_review}
          />
        </div>
      ) : null}

      {booking.can_review_boat || booking.can_review_user ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {booking.can_review_boat ? (
            <button
              type="button"
              onClick={() =>
                setOpenReviewType((current) => (current === 'boat' ? '' : 'boat'))
              }
              className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              {openReviewType === 'boat' ? 'Hide boat review' : 'Leave boat review'}
            </button>
          ) : null}

          {booking.can_review_user ? (
            <button
              type="button"
              onClick={() =>
                setOpenReviewType((current) => (current === 'user' ? '' : 'user'))
              }
              className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              {openReviewType === 'user'
                ? 'Hide host review'
                : `Review ${booking.review_target_role || 'host'}`}
            </button>
          ) : null}
        </div>
      ) : null}

      {openReviewType === 'boat' && booking.can_review_boat ? (
        <div className="mt-4">
          <ReviewForm
            bookingId={booking.id}
            reviewType="boat"
            onReviewCreated={handleReviewCreated}
          />
        </div>
      ) : null}

      {openReviewType === 'user' && booking.can_review_user ? (
        <div className="mt-4">
          <ReviewForm
            bookingId={booking.id}
            reviewType="user"
            onReviewCreated={handleReviewCreated}
          />
        </div>
      ) : null}
    </div>
  )
}
