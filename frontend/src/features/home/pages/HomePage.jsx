import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import FiltersBar from '../../../components/FiltersBar'
import LoadingState from '../../../components/ui/LoadingState'
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
    <main className="min-h-screen overflow-hidden bg-[#071d32] text-white">
      <PageContainer size="wide" as="div" className="py-8 md:py-10">
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
          <section
            className="relative overflow-hidden rounded-[32px] border border-gold/25 bg-navy px-6 py-12 text-center shadow-soft md:px-10 md:py-16"
            aria-label="No boat listings found"
          >
            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-ocean/40 blur-3xl" />

            <div className="relative mx-auto max-w-lg">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/35 bg-[#071d32]/80 text-gold shadow-sm ring-4 ring-gold/10">
                <MagnifyingGlassIcon className="h-9 w-9" />
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.28em] text-gold">
                No results
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                No boats found
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70 md:text-base">
                Try another search or clear the filters to see more available boats.
              </p>
            </div>
          </section>
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
    </main>
  )
}