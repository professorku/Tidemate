import { HeartIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import PaginationControls from '../../../components/ui/PaginationControls'
import FavoritesGrid from '../../favorites/components/FavoritesGrid'
import useFavoritesPageData from '../../favorites/hooks/useFavoritesPageData'

export default function FavoritesPage() {
  const { boats, loading, error, pagination, setPage, handleFavoriteChange, reload } = useFavoritesPageData()

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>
        <p className="mt-2 text-slate-600">
          Boats you have saved for later.
        </p>
      </div>

      {loading ? (
        <LoadingState
          icon={<HeartIcon className="h-8 w-8" />}
          title="Loading favorites"
          text="We are fetching the boats you saved for later."
        />
      ) : null}

      {!loading && error ? (
        <ErrorState
          title="Could not load favorites"
          message={error}
          onRetry={() => reload(pagination.page || 1)}
        />
      ) : null}

      {!loading && !error && boats.length === 0 ? (
        <EmptyState
          icon={<HeartIcon className="h-8 w-8" />}
          title="No favorites yet"
          text="Start exploring boats and save the ones you like."
          actionLabel="Browse boats"
          actionTo="/"
          compact={false}
        />
      ) : null}

      {!loading && !error && boats.length > 0 ? (
        <>
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
        </>
      ) : null}
    </PageContainer>
  )
}
