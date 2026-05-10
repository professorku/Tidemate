import {
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import LoadingState from '../../../components/ui/LoadingState'
import PaginationControls from '../../../components/ui/PaginationControls'
import ModerationFilters from '../components/ModerationFilters'
import ModerationReportCard from '../components/ModerationReportCard'
import ModerationStatCard from '../components/ModerationStatCard'
import useModerationReports from '../hooks/useModerationReports'

export default function ModerationPage() {
  const {
    stats,
    reportsData,
    filters,
    setFilters,
    notesById,
    loading,
    updatingId,
    error,
    loadData,
    handleNoteChange,
    handleUpdateStatus,
  } = useModerationReports()

  return (
    <PageContainer className="space-y-8 py-8">
      <section className="overflow-hidden rounded-[34px] border border-gold/20 bg-navy text-white shadow-soft">
        <div className="px-6 py-7 md:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-gold">
            Staff only
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Moderation panel
              </h1>

              <p className="mt-3 max-w-2xl text-white/65">
                Review user reports for listings, profiles, reviews, and chat messages.
              </p>
            </div>

            <div className="rounded-2xl border border-gold/20 bg-[#071d32]/70 px-4 py-3 text-sm font-semibold text-white/75">
              API protected by backend staff permissions
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ModerationStatCard
          label="Pending"
          value={stats?.pending}
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        />

        <ModerationStatCard
          label="Reviewing"
          value={stats?.reviewing}
          icon={<ShieldCheckIcon className="h-6 w-6" />}
        />

        <ModerationStatCard
          label="Resolved"
          value={stats?.resolved}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />

        <ModerationStatCard
          label="Dismissed"
          value={stats?.dismissed}
          icon={<XCircleIcon className="h-6 w-6" />}
        />

        <ModerationStatCard
          label="Total"
          value={stats?.total}
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        />
      </div>

      <ModerationFilters
        filters={filters}
        setFilters={setFilters}
        onRefresh={() => void loadData()}
      />

      {loading ? (
        <div className="rounded-[28px] border border-gold/20 bg-navy px-6 py-10 shadow-soft">
          <LoadingState
            title="Loading reports"
            text="Fetching moderation queue..."
          />
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-300/30 bg-red-500/10 px-6 py-5 text-red-100 shadow-soft">
          {error}
        </div>
      ) : reportsData.results.length === 0 ? (
        <div className="rounded-[28px] border border-gold/20 bg-navy px-6 py-10 text-center text-white shadow-soft">
          <p className="text-xl font-black text-white">
            No reports found
          </p>

          <p className="mt-2 text-white/60">
            Try changing the filters or search query.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {reportsData.results.map((report) => (
              <ModerationReportCard
                key={report.id}
                report={report}
                updatingId={updatingId}
                noteValue={notesById[report.id] || ''}
                onNoteChange={handleNoteChange}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>

          <PaginationControls
            page={reportsData.page}
            totalPages={reportsData.totalPages}
            count={reportsData.count}
            itemLabel="reports"
            onPrevious={() => setFilters((current) => ({
              ...current,
              page: Math.max(1, current.page - 1),
            }))}
            onNext={() => setFilters((current) => ({
              ...current,
              page: current.page + 1,
            }))}
          />
        </>
      )}
    </PageContainer>
  )
}