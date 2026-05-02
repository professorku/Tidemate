import { ExclamationTriangleIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../../components/layout/PageContainer'

export function PublicProfileLoadingState() {
  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="wide" className="py-8 md:py-10" as="div">
        <section className="rounded-[34px] border border-gold/20 bg-navy p-6 text-white shadow-soft md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="h-28 w-28 animate-pulse rounded-full border-4 border-gold/40 bg-white/15 md:h-32 md:w-32" />
              <div className="space-y-3">
                <div className="h-4 w-36 animate-pulse rounded-full bg-gold/40" />
                <div className="h-10 w-64 animate-pulse rounded-full bg-white/15" />
                <div className="h-4 w-96 max-w-full animate-pulse rounded-full bg-white/10" />
                <div className="flex gap-2">
                  <div className="h-9 w-32 animate-pulse rounded-full bg-white/10" />
                  <div className="h-9 w-32 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-11 w-32 animate-pulse rounded-full bg-gold/30" />
              <div className="h-11 w-32 animate-pulse rounded-full bg-white/10" />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-[28px] border border-white/15 bg-navy" />
          <div className="h-32 animate-pulse rounded-[28px] border border-white/15 bg-navy" />
          <div className="h-32 animate-pulse rounded-[28px] border border-white/15 bg-navy" />
        </div>

        <div className="mt-6 h-80 animate-pulse rounded-[32px] border border-white/15 bg-navy" />
      </PageContainer>
    </main>
  )
}

export function PublicProfileErrorState({ error, onRetry }) {
  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="narrow" className="py-8 md:py-10">
        <section className="rounded-[30px] border border-red-300/30 bg-navy p-8 text-center text-white shadow-soft md:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-red-100 ring-1 ring-red-300/30">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </div>

          <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
            Public profile
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
            Profile unavailable
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
            {error || 'Could not load this user.'}
          </p>

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
            >
              <UserCircleIcon className="h-5 w-5" />
              Try again
            </button>
          ) : null}
        </section>
      </PageContainer>
    </main>
  )
}