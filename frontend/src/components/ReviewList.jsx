import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FlagIcon } from '@heroicons/react/24/outline'
import PaginationControls from './ui/PaginationControls'
import ReportModal from './reports/ReportModal'
import StarRating from './StarRating'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { formatDate } from '../utils/format/date'


export default function ReviewList({
  averageRating,
  reviewCount,
  reviews = [],
  page = 1,
  totalPages = 1,
  onPreviousPage,
  onNextPage,
}) {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [selectedReview, setSelectedReview] = useState(null)

  function handleOpenReport(review) {
    if (!isAuthenticated) {
      showToast({
        tone: 'info',
        message: 'Log in to report a review.',
      })
      return
    }

    if (Number(review.reviewer) === Number(user?.id)) {
      showToast({
        tone: 'info',
        message: 'You cannot report your own review.',
      })
      return
    }

    setSelectedReview(review)
  }

  return (
    <>
      <div className="rounded-[28px] border border-gold/20 bg-navy p-6 shadow-soft md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Reviews</h2>
            <p className="mt-2 text-white/65">
              See what past renters thought about this boat.
            </p>
          </div>

          <div className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <StarRating value={Math.round(averageRating || 0)} readOnly />
              <div>
                <p className="text-lg font-bold text-white">
                  {averageRating ? averageRating.toFixed(1) : 'New'}
                </p>
                <p className="text-sm text-white/55">
                  {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="mt-8 rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-6 text-white/65">
            No reviews yet.
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {reviews.map((review) => {
                const isOwnReview = Number(review.reviewer) === Number(user?.id)

                return (
                  <div
                    key={review.id}
                    className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Link
                          to={`/users/${review.reviewer}`}
                          className="text-lg font-bold text-white transition hover:text-gold"
                        >
                          {review.reviewer_username}
                        </Link>
                        <p className="mt-1 text-sm text-white/50">
                          {formatDate(review.created_at, {
                            dateOptions: {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            },
                          })}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <StarRating value={review.rating} readOnly />

                        {!isOwnReview ? (
                          <button
                            type="button"
                            onClick={() => handleOpenReport(review)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-navy px-3 py-1.5 text-xs font-bold text-white transition hover:bg-ocean"
                          >
                            <FlagIcon className="h-4 w-4 text-gold" />
                            Report
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap leading-7 text-white/70">
                      {review.comment || 'No written comment provided.'}
                    </p>
                  </div>
                )
              })}
            </div>

            <PaginationControls
              page={page}
              totalPages={totalPages}
              count={reviewCount}
              itemLabel="reviews"
              onPrevious={onPreviousPage}
              onNext={onNextPage}
            />
          </>
        )}
      </div>

      <ReportModal
        isOpen={Boolean(selectedReview)}
        targetType="review"
        targetId={selectedReview?.id}
        targetLabel={
          selectedReview
            ? `review by ${selectedReview.reviewer_username || 'user'}`
            : ''
        }
        onClose={() => setSelectedReview(null)}
      />
    </>
  )
}