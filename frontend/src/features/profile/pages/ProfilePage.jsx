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
import ProfileStats from '../../profile/components/ProfileStats'
import useProfilePageData from '../../profile/hooks/useProfilePageData'

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <PageContainer size="wide" className="py-8 md:py-10" as="div">
        <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-32 w-32 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
                <div className="h-9 w-64 animate-pulse rounded-full bg-slate-200" />
                <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-11 w-32 animate-pulse rounded-full bg-slate-100" />
              <div className="h-11 w-32 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-[24px] border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="h-52 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
            <div className="h-80 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
          </div>
          <div className="h-96 animate-pulse rounded-[28px] border border-slate-200 bg-white" />
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
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
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <PageContainer
        size="wide"
        className="py-8 md:py-10"
        as="div"
        contentClassName="space-y-6"
      >
        {error ? (
          <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
            <ArrowPathIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Some profile data could not be refreshed</p>
              <p className="mt-1 leading-6">{error}</p>
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

        <ProfileStats
          profile={profile}
          boats={boats}
          reviewsData={reviewsData}
          profileCompletion={profileCompletion}
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

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-navy">
                <UserCircleIcon className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                Public profile preview
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
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