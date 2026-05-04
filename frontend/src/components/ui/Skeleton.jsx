export function SkeletonBlock({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-white/10 ${className}`.trim()}
    />
  )
}

function SkeletonLineGroup({ lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className={
            index === 0
              ? 'h-4 w-3/4'
              : index === lines - 1
                ? 'h-4 w-1/2'
                : 'h-4 w-full'
          }
        />
      ))}
    </div>
  )
}

export function BoatCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[30px] border border-white/15 bg-navy shadow-soft">
      <SkeletonBlock className="h-56 rounded-none bg-white/10" />

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <SkeletonBlock className="h-5 w-3/4" />
            <SkeletonBlock className="h-4 w-1/2" />
          </div>
          <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <SkeletonBlock className="h-9 rounded-full" />
          <SkeletonBlock className="h-9 rounded-full" />
          <SkeletonBlock className="h-9 rounded-full" />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </article>
  )
}

export function BoatCardSkeletonGrid({ count = 8 }) {
  return (
    <section className="w-full" aria-label="Loading boat listings">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <BoatCardSkeleton key={index} />
        ))}
      </div>
    </section>
  )
}

export function BookingCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[30px] border border-white/15 bg-[#071d32] text-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SkeletonBlock className="min-h-[240px] rounded-none bg-white/10" />

        <div className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-7 w-64 max-w-full" />
            </div>
            <SkeletonBlock className="h-9 w-28 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>

          <SkeletonLineGroup lines={3} />

          <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
            <SkeletonBlock className="h-10 w-32 rounded-full" />
            <SkeletonBlock className="h-10 w-28 rounded-full" />
            <SkeletonBlock className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function BookingCardSkeletonList({ count = 3 }) {
  return (
    <div className="space-y-5" aria-label="Loading bookings">
      {Array.from({ length: count }).map((_, index) => (
        <BookingCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function ConversationCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-[30px] border border-white/15 bg-[#071d32] text-white shadow-soft">
      <div className="flex flex-col lg:flex-row">
        <SkeletonBlock className="min-h-[220px] rounded-none bg-white/10 lg:w-[280px]" />

        <div className="flex min-w-0 flex-1 flex-col gap-5 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <SkeletonBlock className="h-5 w-48 max-w-full" />
              <SkeletonBlock className="h-4 w-72 max-w-full" />
            </div>
            <SkeletonBlock className="h-9 w-20 rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
            <SkeletonBlock className="h-16" />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
            <SkeletonBlock className="h-10 w-32 rounded-full" />
            <SkeletonBlock className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </article>
  )
}

export function ConversationCardSkeletonList({ count = 4 }) {
  return (
    <div className="space-y-5" aria-label="Loading conversations">
      {Array.from({ length: count }).map((_, index) => (
        <ConversationCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function DetailPageSkeleton({ withSidebar = true }) {
  return (
    <div className="space-y-6" aria-label="Loading page details">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SkeletonBlock className="h-10 w-36 rounded-full" />
        <SkeletonBlock className="h-10 w-64 max-w-full rounded-full" />
      </div>

      <div className={withSidebar ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]' : 'space-y-6'}>
        <section className="min-w-0 space-y-6">
          <SkeletonBlock className="h-[280px] rounded-[34px] bg-white/10 md:h-[460px]" />
          <div className="rounded-[30px] border border-white/15 bg-navy p-6 shadow-soft">
            <SkeletonLineGroup lines={4} />
          </div>
          <div className="rounded-[30px] border border-white/15 bg-navy p-6 shadow-soft">
            <SkeletonLineGroup lines={5} />
          </div>
        </section>

        {withSidebar ? (
          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-[30px] border border-white/15 bg-navy p-6 shadow-soft">
              <SkeletonBlock className="h-6 w-40" />
              <div className="mt-6 space-y-3">
                <SkeletonBlock className="h-12 rounded-2xl" />
                <SkeletonBlock className="h-12 rounded-2xl" />
                <SkeletonBlock className="h-24 rounded-2xl" />
                <SkeletonBlock className="h-12 rounded-full bg-gold/25" />
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
