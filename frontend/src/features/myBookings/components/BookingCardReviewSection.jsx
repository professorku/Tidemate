import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import ReviewForm from '../../../components/ReviewForm'
import { formatRatingLabel } from '../utils/bookingFormatters'

function ReviewPreviewCard({ title, review }) {
  if (!review) return null

  return (
    <div className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold text-white">
        {formatRatingLabel(review.rating)} · {review.rating}/5
      </p>

      <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/65">
        {review.comment_preview || 'No written comment.'}
      </p>
    </div>
  )
}

function ReviewModal({ open, reviewType, booking, onClose, onReviewCreated }) {
  if (!open || !reviewType) return null

  const title =
    reviewType === 'boat'
      ? 'Review this boat'
      : `Review ${booking.review_target_role || 'host'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/15 bg-navy shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-gold">
              Post-trip review
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
            aria-label="Close review form"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <ReviewForm
            bookingId={booking.id}
            reviewType={reviewType}
            onReviewCreated={onReviewCreated}
          />
        </div>
      </div>
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
    <>
      <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold text-navy ring-1 ring-gold/40">
              <StarIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
                Post-trip
              </p>

              <h3 className="text-sm font-extrabold text-white">
                {reviewHeadline}
              </h3>

              <p className="mt-0.5 line-clamp-1 text-sm text-white/60">
                Review the trip or book this boat again.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {booking.can_review_boat ? (
              <button
                type="button"
                onClick={() => setOpenReviewType('boat')}
                className="rounded-full border border-white/20 bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ocean"
              >
                Review boat
              </button>
            ) : null}

            {booking.can_review_user ? (
              <button
                type="button"
                onClick={() => setOpenReviewType('user')}
                className="rounded-full border border-white/20 bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ocean"
              >
                Review {booking.review_target_role || 'host'}
              </button>
            ) : null}

            <Link
              to={`/boats/${booking.boat}`}
              className="rounded-full bg-gold px-4 py-2 text-center text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
            >
              Book again
            </Link>
          </div>
        </div>

        {booking.viewer_boat_review || booking.viewer_user_review ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
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
      </div>

      <ReviewModal
        open={Boolean(openReviewType)}
        reviewType={openReviewType}
        booking={booking}
        onClose={() => setOpenReviewType('')}
        onReviewCreated={handleReviewCreated}
      />
    </>
  )
}