import PageContainer from '../layout/PageContainer'

export default function RouteLoadingFallback({
  title = 'Loading page',
  text = 'Preparing your TideMate experience.',
}) {
  return (
    <PageContainer className="py-6 md:py-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="mt-1 h-10 w-10 animate-pulse rounded-2xl bg-slate-200" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <div className="mt-2 h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 max-w-sm animate-pulse rounded bg-slate-100" />
            <p className="mt-4 text-sm text-slate-500">{text}</p>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
