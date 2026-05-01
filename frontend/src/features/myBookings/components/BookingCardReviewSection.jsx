import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StarIcon } from '@heroicons/react/24/outline'
import ReviewForm from '../../../components/ReviewForm'
import { formatRatingLabel } from '../utils/bookingFormatters'

function ReviewPreviewCard({ title, review }) {
  if (!review) return null

  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/15 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold">
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

export default function BookingCardReviewSection({ booking, isCompleted, onRefresh }) {
  const [openReviewType, setOpenReviewType] = useState('')

  const reviewHeadline = useMemo(() => {
    if (booking.viewer_boat_review || booking.viewer_user_review) {
      return 'Your review'
    }

    if (booking.can_review_boat || booking.can_review_user) {
      return 'Leave a review'
    }

    return 'Completed trip'
  }, [booking])

  const handleReviewCreated = async () => {
    setOpenReviewType('')
    if (onRefresh) {
      await onRefresh()
    }
  }

  if (!isCompleted) return null

  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold text-navy ring-1 ring-gold/40">
            <StarIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">
              Post-trip
            </p>

            <h3 className="mt-1 text-base font-bold text-white">
              {reviewHeadline}
            </h3>

            <p className="mt-1 text-sm leading-6 text-white/65">
              This trip is finished. You can review the experience or book the boat again.
            </p>
          </div>
        </div>

        <Link
          to={`/boats/${booking.boat}`}
          className="rounded-full bg-gold px-4 py-2.5 text-center text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
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
              className="rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean"
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
              className="rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean"
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