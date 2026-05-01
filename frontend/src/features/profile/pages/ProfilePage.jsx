import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import ProfileReviewList from '../../../components/ProfileReviewList'
import StatePanel from '../../../components/ui/StatePanel'
import AboutSection from '../../profile/components/AboutSection'
import BoatsSection from '../../profile/components/BoatsSection'
import ProfileDetailsCard from '../../profile/components/ProfileDetailsCard'
import ProfileHero from '../../profile/components/ProfileHero'
import useProfilePageData from '../../profile/hooks/useProfilePageData'

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="wide" className="py-8 md:py-10" as="div">
        <div className="rounded-[34px] border border-white/15 bg-navy p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-32 w-32 animate-pulse rounded-full bg-white/15" />
              <div className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded-full bg-gold/40" />
                <div className="h-9 w-64 animate-pulse rounded-full bg-white/15" />
                <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-white/10" />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-11 w-32 animate-pulse rounded-full bg-gold/30" />
              <div className="h-11 w-32 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="h-52 animate-pulse rounded-[28px] border border-white/15 bg-navy" />
            <div className="h-80 animate-pulse rounded-[28px] border border-white/15 bg-navy" />
          </div>

          <div className="h-96 animate-pulse rounded-[28px] border border-white/15 bg-navy" />
        </div>
      </PageContainer>
    </main>
  )
}

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
    missingProfileItems,
    handleAvatarChange,
    reload,
  } = useProfilePageData()

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer size="content" className="py-8 md:py-10">
          <StatePanel
            icon={<ExclamationTriangleIcon className="h-8 w-8" />}
            title="Profile unavailable"
            text={error || 'Could not load your profile.'}
            actionLabel="Try again"
            onAction={reload}
            tone="error"
            compact
          />
        </PageContainer>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer
        size="wide"
        className="py-8 md:py-10"
        as="div"
        contentClassName="space-y-6"
      >
        {error ? (
          <div className="flex items-start gap-3 rounded-[24px] border border-gold/40 bg-gold/15 p-4 text-sm text-white shadow-sm">
            <ArrowPathIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div>
              <p className="font-bold text-white">
                Some profile data could not be refreshed
              </p>
              <p className="mt-1 leading-6 text-white/70">{error}</p>
            </div>
          </div>
        ) : null}

        <ProfileHero
          profile={profile}
          initials={initials}
          profileCompletion={profileCompletion}
          missingProfileItems={missingProfileItems}
          reviewsData={reviewsData}
          uploading={uploading}
          onAvatarChange={handleAvatarChange}
        />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <AboutSection profile={profile} missingProfileItems={missingProfileItems} />
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
            <ProfileDetailsCard
              profile={profile}
              reviewsData={reviewsData}
              boats={boats}
              profileCompletion={profileCompletion}
              missingProfileItems={missingProfileItems}
            />

            <div className="rounded-[28px] border border-white/15 bg-navy p-6 text-center text-white shadow-soft">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
                <UserCircleIcon className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-white">
                Public profile preview
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/65">
                This is the information renters and hosts use to understand who they are
                talking to.
              </p>
            </div>
          </aside>
        </section>
      </PageContainer>
    </main>
  )
}