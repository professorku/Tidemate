import PageContainer from '../../../components/layout/PageContainer'
import ProfileReviewList from '../../../components/ProfileReviewList'
import AboutSection from '../../profile/components/AboutSection'
import BoatsSection from '../../profile/components/BoatsSection'
import ProfileDetailsCard from '../../profile/components/ProfileDetailsCard'
import ProfileHero from '../../profile/components/ProfileHero'
import ProfileStats from '../../profile/components/ProfileStats'
import useProfilePageData from '../../profile/hooks/useProfilePageData'

export default function ProfilePage() {
  const {
    profile,
    reviewsData,
    reviewsPage,
    loadPage,
    boats,
    loading,
    error,
    uploading,
    initials,
    profileCompletion,
    handleAvatarChange,
  } = useProfilePageData()

  if (loading) {
    return (
      <PageContainer className="py-6 md:py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-600">Loading profile...</p>
        </div>
      </PageContainer>
    )
  }

  if (!profile) {
    return (
      <PageContainer size="narrow" className="py-6 md:py-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Profile unavailable</h1>
          <p className="mt-3 text-slate-600">{error || 'Could not load your profile.'}</p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <ProfileHero
        profile={profile}
        initials={initials}
        profileCompletion={profileCompletion}
        reviewsData={reviewsData}
        uploading={uploading}
        error={error}
        onAvatarChange={handleAvatarChange}
      />

      <ProfileStats profile={profile} boats={boats} reviewsData={reviewsData} />

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <AboutSection profile={profile} />
          <BoatsSection boats={boats} />

          <ProfileReviewList
            title="Reviews about you"
            averageRating={reviewsData.average_rating}
            reviewCount={reviewsData.review_count}
            reviews={reviewsData.results}
            page={reviewsPage}
            totalPages={reviewsData.totalPages}
            onPreviousPage={() => loadPage(reviewsPage - 1)}
            onNextPage={() => loadPage(reviewsPage + 1)}
          />
        </div>

        <aside className="space-y-6">
          <ProfileDetailsCard profile={profile} />
        </aside>
      </section>
    </PageContainer>
  )
}
