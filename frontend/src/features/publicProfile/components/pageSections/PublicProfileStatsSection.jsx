import PublicProfileStats from '../PublicProfileStats'

export default function PublicProfileStatsSection({
  joinedText,
  reviewCount,
  averageRating,
  boatCount,
}) {
  return (
    <PublicProfileStats
      joinedText={joinedText}
      reviewCount={reviewCount}
      averageRating={averageRating}
      boatCount={boatCount}
    />
  )
}
