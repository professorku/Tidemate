import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import FiltersBar from '../../../components/FiltersBar'
import LoadingState from '../../../components/ui/LoadingState'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import HomeHero from '../../home/components/HomeHero'
import HomeResults from '../../home/components/HomeResults'
import PaginationControls from '../../../components/ui/PaginationControls'
import useHomePageData from '../../home/hooks/useHomePageData'

export default function HomePage() {
  const {
    boats,
    error,
    loading,
    filters,
    setFilters,
    handleApply,
    handleClear,
    pagination,
    setPage,
  } = useHomePageData()

  return (
    <PageContainer size="wide">
      <HomeHero />

      <div className="mb-6">
        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          onApply={handleApply}
          onClear={handleClear}
        />
      </div>

      {loading ? (
        <LoadingState
          title="Loading boats"
          text="We are fetching the latest boats for your search."
        />
      ) : error ? (
        <ErrorState
          title="Could not load boats"
          message={error}
          actionLabel="Try again"
          onRetry={handleApply}
          compact={false}
        />
      ) : boats.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlassIcon className="h-8 w-8" />}
          title="No boats found"
          text="Try another search or clear the filters."
          tone="subtle"
          compact={false}
        />
      ) : (
        <>
          <HomeResults boats={boats} />
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            count={pagination.count}
            itemLabel="boats"
            onPrevious={() => setPage(pagination.page - 1)}
            onNext={() => setPage(pagination.page + 1)}
            disabled={loading}
          />
        </>
      )}
    </PageContainer>
  )
}
