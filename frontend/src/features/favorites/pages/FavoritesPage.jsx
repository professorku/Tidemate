import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import PaginationControls from '../../../components/ui/PaginationControls'
import { BoatCardSkeletonGrid, SkeletonBlock } from '../../../components/ui/Skeleton'
import FavoritesEmptyState from '../../favorites/components/FavoritesEmptyState'
import FavoritesGrid from '../../favorites/components/FavoritesGrid'
import useFavoritesPageData from '../../favorites/hooks/useFavoritesPageData'

function FavoritesHero() {
  return (
    <section className="overflow-hidden rounded-[34px] border border-white/15 bg-navy text-white shadow-soft">
      <div className="relative px-6 py-8 md:px-8 md:py-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

        <div className="relative">
          <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            My Favorites
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
            Keep track of boats you love and come back when you are ready to
            book your next trip.
          </p>
        </div>
      </div>
    </section>
  )
}

function FavoritesLoadingState() {
  return (
    <section className="rounded-[34px] border border-white/15 bg-navy p-4 text-white shadow-soft md:p-6">
      <div className="mb-6">
        <SkeletonBlock className="h-4 w-36 bg-gold/30" />
        <SkeletonBlock className="mt-3 h-8 w-56" />
        <SkeletonBlock className="mt-3 h-4 w-full max-w-xl" />
      </div>

      <BoatCardSkeletonGrid count={4} />
    </section>
  )
}

function FavoritesErrorState({ message, onRetry }) {
  return (
    <section className="rounded-[34px] border border-red-300/25 bg-navy p-8 text-center text-white shadow-soft">
      <div className="mx-auto flex max-w-lg flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-200 ring-1 ring-red-300/20">
          <ExclamationTriangleIcon className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-2xl font-black tracking-tight text-white">
          Could not load favorites
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/60">{message}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
        >
          Try again
        </button>
      </div>
    </section>
  )
}

export default function FavoritesPage() {
  const {
    boats,
    loading,
    error,
    pagination,
    setPage,
    handleFavoriteChange,
    reload,
  } = useFavoritesPageData()

  return (
    <main className="min-h-screen bg-[#071d32] text-white">
      <PageContainer
        size="wide"
        as="div"
        className="py-8 md:py-10"
        contentClassName="space-y-7"
      >
        <FavoritesHero />

        {loading ? <FavoritesLoadingState /> : null}

        {!loading && error ? (
          <FavoritesErrorState
            message={error}
            onRetry={() => reload(pagination.page || 1)}
          />
        ) : null}

        {!loading && !error && boats.length === 0 ? (
          <FavoritesEmptyState />
        ) : null}

        {!loading && !error && boats.length > 0 ? (
          <section className="rounded-[34px] border border-white/15 bg-navy p-4 shadow-soft md:p-6">
            <div className="mb-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
                Favorite fleet
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                Boats you saved
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Open a boat to view details, check availability, or remove it
                from your favorites.
              </p>
            </div>

            <FavoritesGrid
              boats={boats}
              onFavoriteChange={handleFavoriteChange}
            />

            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              count={pagination.count}
              itemLabel="favorites"
              onPrevious={() => setPage(pagination.page - 1)}
              onNext={() => setPage(pagination.page + 1)}
            />
          </section>
        ) : null}
      </PageContainer>
    </main>
  )
}