import PublicProfileHero from '../PublicProfileHero'
import PublicProfileStatusBanners from '../PublicProfileStatusBanners'
import PublicProfileActionButtons from './PublicProfileActionButtons'

export default function PublicProfileHeaderCard({
  profile,
  initials,
  joinedText,
  reviewCount,
  averageRating,
  refreshing,
  actionMessage,
  isMe,
  canMessage,
  actionLoading,
  isBlocked,
  hasBlockedYou,
  isCrewmate,
  handleStartMessage,
  handleToggleCrew,
  handleToggleBlock,
}) {
  const actions = (
    <PublicProfileActionButtons
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
  )

  const hasStatus = refreshing || actionMessage || hasBlockedYou || isBlocked

  return (
    <section className="overflow-hidden rounded-[34px] border border-gold/20 bg-navy text-white shadow-soft">
      <PublicProfileHero
        profile={profile}
        initials={initials}
        joinedText={joinedText}
        reviewCount={reviewCount}
        averageRating={averageRating}
        actions={actions}
      />

      {hasStatus ? (
        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <PublicProfileStatusBanners
            refreshing={refreshing}
            actionMessage={actionMessage}
            hasBlockedYou={hasBlockedYou}
            isBlocked={isBlocked}
          />
        </div>
      ) : null}
    </section>
  )
}