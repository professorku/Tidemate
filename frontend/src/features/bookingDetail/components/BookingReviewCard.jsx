import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/outline'
import ReviewForm from '../../../components/ReviewForm'
import { formatRatingLabel } from '../utils/bookingFormatters'

function ReviewPreviewCard({ title, review }) {
  if (!review) return null

  return (
    <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
        {title}
      </p>

      <p className="mt-2 text-sm font-bold text-white">
        {formatRatingLabel(review.rating)} · {review.rating}/5
      </p>

      <p className="mt-2 text-sm leading-6 text-white/70">
        {review.comment_preview || 'No written comment.'}
      </p>
    </div>
  )
}

export default function BookingReviewCard({ booking, onRefresh }) {
  const [openReviewType, setOpenReviewType] = useState('')

  const shouldShow =
    booking.trip_finished ||
    booking.viewer_boat_review ||
    booking.viewer_user_review ||
    booking.can_review_boat ||
    booking.can_review_user

  const reviewHeadline = useMemo(() => {
    if (booking.viewer_boat_review || booking.viewer_user_review) {
      return 'Your review'
    }

    if (booking.can_review_boat || booking.can_review_user) {
      return 'Leave a review'
    }

    return 'Post-trip'
  }, [booking])

  const handleReviewCreated = async () => {
    setOpenReviewType('')
    if (onRefresh) {
      await onRefresh()
    }
  }

  if (!shouldShow) return null

  return (
    <div className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
            <StarIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Completed trip
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-white">
              {reviewHeadline}
            </h2>
            <p className="mt-1 text-sm leading-6 text-white/60">
              Share feedback after the trip or check the review you already submitted.
            </p>
          </div>
        </div>

        <Link
          to={`/boats/${booking.boat}`}
          className="rounded-full bg-gold px-4 py-2.5 text-center text-sm font-semibold text-navy transition hover:bg-gold/90"
        >
          Book again
        </Link>
      </div>

      {booking.viewer_boat_review || booking.viewer_user_review ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ReviewPreviewCard
            title="Your boat review"
            review={booking.viewer_boat_review}
          />
          <ReviewPreviewCard
            title={`Your ${booking.review_target_role || 'user'} review`}
            review={booking.viewer_user_review}
          />
        </div>
      ) : null}

      {booking.can_review_boat || booking.can_review_user ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {booking.can_review_boat ? (
            <button
              type="button"
              onClick={() =>
                setOpenReviewType((current) => (current === 'boat' ? '' : 'boat'))
              }
              className="rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
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
              className="rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {openReviewType === 'user'
                ? 'Hide user review'
                : `Review ${booking.review_target_role || 'user'}`}
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