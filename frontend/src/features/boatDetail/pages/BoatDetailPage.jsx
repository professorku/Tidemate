import { useParams } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import BoatImageGallery from '../../../components/BoatImageGallery'
import BookingForm from '../../bookingForm/components/BookingForm'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import MarineConditionsCard from '../../../components/marineConditions/MarineConditionsCard'

import BoatDetailHeader from '../../boatDetail/components/BoatDetailHeader'
import BoatDetailDescription from '../../boatDetail/components/BoatDetailDescription'
import BoatDetailReviews from '../../boatDetail/components/BoatDetailReviews'
import BoatDetailLocation from '../../boatDetail/components/BoatDetailLocation'
import BoatOwnerNotice from '../../boatDetail/components/BoatOwnerNotice'

import useBoatDetailPage from '../../boatDetail/hooks/useBoatDetailPage'

export default function BoatDetailPage() {
  const { id } = useParams()

  const {
    boat,
    reviewsData,
    reviewableBooking,
    reviewsPage,
    isOwner,
    error,
    loadBoat,
    loadReviews,
    loadReviewEligibility,
  } = useBoatDetailPage(id)

  if (error) {
    return (
      <PageContainer size="narrow" className="py-6 md:py-8">
        <ErrorState
          title="Boat detail unavailable"
          message={error}
          actionLabel="Retry"
          onRetry={loadBoat}
          compact={false}
        />
      </PageContainer>
    )
  }

  if (!boat) {
    return (
      <PageContainer size="narrow" className="py-6 md:py-8" contentClassName="space-y-0">
        <LoadingState
          title="Loading boat details"
          text="We are preparing photos, availability, and location details."
          compact={false}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <section className="min-w-0">
          <BoatImageGallery boat={boat} />

          <BoatDetailHeader boat={boat} reviewsData={reviewsData} />

          <BoatDetailDescription boat={boat} />

          <BoatDetailReviews
            boat={boat}
            reviewsData={reviewsData}
            reviewableBooking={reviewableBooking}
            reloadReviews={loadReviews}
            reloadEligibility={loadReviewEligibility}
            reviewsPage={reviewsPage}
          />

          <BoatDetailLocation boat={boat} />

          <MarineConditionsCard boatId={boat.id} />
        </section>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          {isOwner ? (
            <BoatOwnerNotice />
          ) : (
            <BookingForm boat={boat} onBookingCreated={loadBoat} />
          )}
        </aside>
      </div>
    </PageContainer>
  )
}
