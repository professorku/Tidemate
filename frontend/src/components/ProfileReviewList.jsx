import { Link } from 'react-router-dom'
import PaginationControls from './ui/PaginationControls'
import StarRating from './StarRating'
import { formatDate } from '../utils/format/date'

export default function ProfileReviewList({
  averageRating,
  reviewCount,
  reviews = [],
  title = 'Profile reviews',
  page = 1,
  totalPages = 1,
  onPreviousPage,
  onNextPage,
}) {
  const hasReviews = reviews.length > 0

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Reviews
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <StarRating value={Math.round(averageRating || 0)} readOnly />
            <div>
              <p className="text-lg font-bold text-slate-900">
                {averageRating ? averageRating.toFixed(1) : 'New'}
              </p>
              <p className="text-sm text-slate-500">
                {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!hasReviews ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-600">
          No profile reviews yet.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 md:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/users/${review.reviewer}`}
                        className="text-lg font-bold text-slate-900 transition hover:text-slate-700"
                      >
                        {review.reviewer_username}
                      </Link>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                        {formatDate(review.created_at, { dateOptions: { day: 'numeric', month: 'long', year: 'numeric' } })}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Stayed on <span className="font-medium text-slate-700">{review.boat_title}</span>
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                    <StarRating value={review.rating} readOnly />
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
                  {review.comment || 'No written comment provided.'}
                </p>
              </article>
            ))}
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
    </section>
  )
}
