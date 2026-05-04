import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import BoatImageGallery from '../../../components/BoatImageGallery'
import BookingForm from '../../bookingForm/components/BookingForm'
import ErrorState from '../../../components/ui/ErrorState'
import { DetailPageSkeleton } from '../../../components/ui/Skeleton'
import MarineConditionsCard from '../../../components/marineConditions/MarineConditionsCard'
import NearbyBoats from '../../../components/NearbyBoats'

import BoatDetailHeader from '../../boatDetail/components/BoatDetailHeader'
import BoatDetailDescription from '../../boatDetail/components/BoatDetailDescription'
import BoatDetailReviews from '../../boatDetail/components/BoatDetailReviews'
import BoatDetailLocation from '../../boatDetail/components/BoatDetailLocation'
import BoatOwnerNotice from '../../boatDetail/components/BoatOwnerNotice'

import useBoatDetailPage from '../../boatDetail/hooks/useBoatDetailPage'

function BoatDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="wide" as="div" className="py-8 md:py-10">
        <DetailPageSkeleton />
      </PageContainer>
    </main>
  )
}

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
    handleFavoriteChange,
  } = useBoatDetailPage(id)

  if (error) {
    return (
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer size="content" className="py-8 md:py-10">
          <ErrorState
            title="Boat detail unavailable"
            message={error}
            actionLabel="Retry"
            onRetry={loadBoat}
            compact={false}
          />

          <div className="mt-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gold" />
              Back to boats
            </Link>
          </div>
        </PageContainer>
      </main>
    )
  }

  if (!boat) {
    return <BoatDetailSkeleton />
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer
        size="wide"
        as="div"
        className="py-8 md:py-10"
        contentClassName="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
          >
            <ArrowLeftIcon className="h-4 w-4 text-gold" />
            Back to boats
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white/80 shadow-sm">
            <ExclamationTriangleIcon className="h-4 w-4 text-gold" />
            Pickup details are protected until booking is confirmed
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0 space-y-6">
            <div className="rounded-[34px] border border-gold/20 bg-navy p-3 shadow-soft">
              <BoatImageGallery boat={boat} />
            </div>

            <BoatDetailHeader
              boat={boat}
              reviewsData={reviewsData}
              isOwner={isOwner}
              onFavoriteChange={handleFavoriteChange}
            />

            <BoatDetailDescription boat={boat} />

            <BoatDetailLocation boat={boat} />

            <BoatDetailReviews
              boat={boat}
              reviewsData={reviewsData}
              reviewableBooking={reviewableBooking}
              reloadReviews={loadReviews}
              reloadEligibility={loadReviewEligibility}
              reviewsPage={reviewsPage}
            />

            <MarineConditionsCard boatId={boat.id} />

            <NearbyBoats boat={boat} />
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            {isOwner ? (
              <BoatOwnerNotice boat={boat} />
            ) : (
              <BookingForm boat={boat} onBookingCreated={loadBoat} />
            )}
          </aside>
        </div>
      </PageContainer>
    </main>
  )
}