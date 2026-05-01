import { StarIcon } from '@heroicons/react/24/outline'
import ReviewForm from '../../../components/ReviewForm'
import ReviewList from '../../../components/ReviewList'
import { isAuthenticated } from '../../../utils/auth'

export default function BoatDetailReviews({
  boat,
  reviewsData,
  reviewableBooking,
  reloadReviews,
  reloadEligibility,
  reviewsPage,
}) {
  const canReview = isAuthenticated() && reviewableBooking?.can_review_boat

  return (
    <section className="space-y-6">
      {canReview ? (
        <div className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-7">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
              <StarIcon className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Completed trip
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">
                Review this boat
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Share feedback about {boat?.title || 'this boat'} after your completed
                trip.
              </p>
            </div>
          </div>

          <ReviewForm
            bookingId={reviewableBooking.booking_id}
            reviewType="boat"
            onReviewCreated={() => {
              reloadReviews()
              reloadEligibility()
            }}
          />
        </div>
      ) : null}

      <ReviewList
        averageRating={reviewsData.average_rating}
        reviewCount={reviewsData.review_count}
        reviews={reviewsData.results}
        page={reviewsPage}
        totalPages={reviewsData.totalPages}
        onPreviousPage={() => reloadReviews(reviewsPage - 1)}
        onNextPage={() => reloadReviews(reviewsPage + 1)}
      />
    </section>
  )
}