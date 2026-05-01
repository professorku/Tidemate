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
    <section className="rounded-[30px] border border-white/15 bg-navy p-6 text-white shadow-soft md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            Reviews
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            {title}
          </h2>
        </div>

        <div className="rounded-2xl border border-gold/40 bg-gold/15 px-4 py-3">
          <div className="flex items-center gap-3">
            <StarRating value={Math.round(averageRating || 0)} readOnly />

            <div>
              <p className="text-lg font-extrabold text-white">
                {averageRating ? averageRating.toFixed(1) : 'New'}
              </p>

              <p className="text-sm text-white/65">
                {reviewCount} review{reviewCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!hasReviews ? (
        <div className="mt-6 rounded-3xl border border-dashed border-white/25 bg-white/10 px-6 py-8 text-center text-white/70">
          No profile reviews yet.
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-3xl border border-white/15 bg-white/10 p-5 md:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/users/${review.reviewer}`}
                        className="text-lg font-extrabold text-white transition hover:text-gold"
                      >
                        {review.reviewer_username}
                      </Link>

                      <span className="rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white/60 ring-1 ring-white/15">
                        {formatDate(review.created_at, {
                          dateOptions: {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          },
                        })}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-white/60">
                      Stayed on{' '}
                      <span className="font-medium text-white/80">
                        {review.boat_title}
                      </span>
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gold/15 px-3 py-2 shadow-sm ring-1 ring-gold/30">
                    <StarRating value={review.rating} readOnly />
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-white/75">
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