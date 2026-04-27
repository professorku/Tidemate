import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import ProfileReviewList from '../../../components/ProfileReviewList'
import PublicProfileBoats from '../../publicProfile/components/PublicProfileBoats'
import PublicProfileReviewSection from '../../publicProfile/components/PublicProfileReviewSection'
import PublicProfileHeaderCard from '../../publicProfile/components/pageSections/PublicProfileHeaderCard'
import {
  PublicProfileErrorState,
  PublicProfileLoadingState,
} from '../../publicProfile/components/pageSections/PublicProfilePageStates'
import PublicProfileStatsSection from '../../publicProfile/components/pageSections/PublicProfileStatsSection'
import usePublicProfilePage from '../../publicProfile/hooks/usePublicProfilePage'
import { formatMemberSince as formatJoinedDate } from '../../../utils/format/date'

export default function PublicProfilePage() {
  const { id } = useParams()

  const {
    profile,
    reviewsData,
    reviewsPage,
    boats,
    reviewableBookings,
    loading,
    refreshing,
    error,
    actionLoading,
    actionMessage,
    isMe,
    isBlocked,
    hasBlockedYou,
    isCrewmate,
    canMessage,
    handleStartMessage,
    handleToggleCrew,
    handleToggleBlock,
    reloadPage,
  } = usePublicProfilePage(id)

  const initials = useMemo(() => {
    const username = profile?.username || 'TM'
    return username.slice(0, 2).toUpperCase()
  }, [profile])

  if (loading) {
    return <PublicProfileLoadingState />
  }

  if (!profile) {
    return <PublicProfileErrorState error={error} onRetry={() => reloadPage({ page: 1 })} />
  }

  const reviewCount = reviewsData?.review_count || 0
  const averageRating = reviewsData?.average_rating || null
  const boatCount = boats?.length || 0
  const joinedText = formatJoinedDate(profile.member_since)

  return (
    <PageContainer className="py-6 md:py-8">
      <div className="space-y-6">
        <PublicProfileHeaderCard
          profile={profile}
          initials={initials}
          joinedText={joinedText}
          reviewCount={reviewCount}
          averageRating={averageRating}
          refreshing={refreshing}
          actionMessage={actionMessage}
          isMe={isMe}
          canMessage={canMessage}
          actionLoading={actionLoading}
          isBlocked={isBlocked}
          hasBlockedYou={hasBlockedYou}
          isCrewmate={isCrewmate}
          handleStartMessage={handleStartMessage}
          handleToggleCrew={handleToggleCrew}
          handleToggleBlock={handleToggleBlock}
        />

        <PublicProfileStatsSection
          joinedText={joinedText}
          reviewCount={reviewCount}
          averageRating={averageRating}
          boatCount={boatCount}
        />

        {!isMe ? (
          <PublicProfileReviewSection
            reviewableBookings={reviewableBookings}
            reloadPage={reloadPage}
          />
        ) : null}

        <PublicProfileBoats boats={boats} profile={profile} />

        <ProfileReviewList
          title={`Reviews for ${profile.username}`}
          averageRating={reviewsData.average_rating}
          reviewCount={reviewCount}
          reviews={reviewsData.results}
          page={reviewsPage}
          totalPages={reviewsData.totalPages}
          onPreviousPage={() => reloadPage({ page: reviewsPage - 1, silent: true })}
          onNextPage={() => reloadPage({ page: reviewsPage + 1, silent: true })}
        />
      </div>
    </PageContainer>
  )
}
