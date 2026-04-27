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
  return (
    <>
      {isAuthenticated() && reviewableBooking?.can_review_boat ? (
        <div className="mt-6 rounded-[28px] bg-white p-6 shadow-soft md:p-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">Review this boat</h2>
            <p className="mt-2 text-slate-600">
              Share feedback about {boat?.title || 'this boat'} after your completed trip.
            </p>
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

      <div className="mt-6">
        <ReviewList
          averageRating={reviewsData.average_rating}
          reviewCount={reviewsData.review_count}
          reviews={reviewsData.results}
          page={reviewsPage}
          totalPages={reviewsData.totalPages}
          onPreviousPage={() => reloadReviews(reviewsPage - 1)}
          onNextPage={() => reloadReviews(reviewsPage + 1)}
        />
      </div>
    </>
  )
}