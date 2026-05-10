import { useCallback, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import { BoatCardSkeletonGrid } from '../../../components/ui/Skeleton'
import ErrorState from '../../../components/ui/ErrorState'
import HomeResults from '../../home/components/HomeResults'
import PaginationControls from '../../../components/ui/PaginationControls'
import useHomePageData from '../../home/hooks/useHomePageData'

const SWIPE_THRESHOLD = 120
const SWIPE_RESET_MS = 150
const SWIPE_COOLDOWN_MS = 700

export default function HomePage() {
  const swipeDeltaRef = useRef(0)
  const swipeLockedRef = useRef(false)
  const resetTimerRef = useRef(null)
  const cooldownTimerRef = useRef(null)

  const {
    boats,
    error,
    loading,
    handleApply,
    pagination,
    setPage,
  } = useHomePageData()

  const canGoPrevious = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

  useEffect(() => {
    return () => {
      window.clearTimeout(resetTimerRef.current)
      window.clearTimeout(cooldownTimerRef.current)
    }
  }, [])

  const handleResultsWheel = useCallback(
    (event) => {
      if (loading || pagination.totalPages <= 1) return

      const absX = Math.abs(event.deltaX)
      const absY = Math.abs(event.deltaY)

      // Ignore normal vertical scrolling.
      if (absX < 6 || absX < absY * 1.25) return

      event.preventDefault()

      if (swipeLockedRef.current) return

      swipeDeltaRef.current += event.deltaX

      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = window.setTimeout(() => {
        swipeDeltaRef.current = 0
      }, SWIPE_RESET_MS)

      if (Math.abs(swipeDeltaRef.current) < SWIPE_THRESHOLD) return

      const shouldGoNext = swipeDeltaRef.current > 0
      const shouldGoPrevious = swipeDeltaRef.current < 0

      if (shouldGoNext && canGoNext) {
        setPage(pagination.page + 1)
      } else if (shouldGoPrevious && canGoPrevious) {
        setPage(pagination.page - 1)
      }

      swipeDeltaRef.current = 0
      swipeLockedRef.current = true

      cooldownTimerRef.current = window.setTimeout(() => {
        swipeLockedRef.current = false
      }, SWIPE_COOLDOWN_MS)
    },
    [
      canGoNext,
      canGoPrevious,
      loading,
      pagination.page,
      pagination.totalPages,
      setPage,
    ]
  )

  return (
    <main className="min-h-screen overflow-hidden bg-[#071d32] text-white">
      <PageContainer size="wide" as="div" className="py-8 md:py-10">
        {loading ? (
          <BoatCardSkeletonGrid count={8} />
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
                Try another search or use the filter button in the navbar to adjust the fleet.
              </p>
            </div>
          </section>
        ) : (
          <>
            <div onWheel={handleResultsWheel}>
              <HomeResults boats={boats} />
            </div>

            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              count={pagination.count}
              itemLabel="boats"
              onPrevious={() => setPage(pagination.page - 1)}
              onNext={() => setPage(pagination.page + 1)}
              disabled={loading}
              variant="plain"
              showCount={false}
            />
          </>
        )}
      </PageContainer>
    </main>
  )
}