import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import LoadingState from '../../../components/ui/LoadingState'
import PaginationControls from '../../../components/ui/PaginationControls'
import { toPaginatedData } from '../../../api/client'
import {
  getModerationReports,
  getModerationReportStats,
  updateModerationReport,
} from '../../../api/domains/moderation'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'
import { formatDate } from '../../../utils/format/date'


const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const TARGET_OPTIONS = [
  { value: '', label: 'All targets' },
  { value: 'listing', label: 'Listings' },
  { value: 'user', label: 'Users' },
  { value: 'review', label: 'Reviews' },
  { value: 'message', label: 'Messages' },
]

const REASON_OPTIONS = [
  { value: '', label: 'All reasons' },
  { value: 'scam', label: 'Scam or fraud' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or abuse' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'wrong_info', label: 'Wrong or misleading information' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
]

const STATUS_CLASSES = {
  pending: 'border-amber-300 bg-amber-50 text-amber-800',
  reviewing: 'border-sky-300 bg-sky-50 text-sky-800',
  resolved: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  dismissed: 'border-slate-300 bg-slate-100 text-slate-700',
}


function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-5 text-white shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black">{value ?? 0}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-gold">
          {icon}
        </div>
      </div>
    </div>
  )
}


function Filters({ filters, setFilters, onRefresh }) {
  function updateFilter(key, value) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }))
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            value={filters.q}
            onChange={(event) => updateFilter('q', event.target.value)}
            placeholder="Search reports, users, messages..."
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
          />
        </div>

        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all-statuses'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.target_type}
          onChange={(event) => updateFilter('target_type', event.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
        >
          {TARGET_OPTIONS.map((option) => (
            <option key={option.value || 'all-targets'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.reason}
          onChange={(event) => updateFilter('reason', event.target.value)}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
        >
          {REASON_OPTIONS.map((option) => (
            <option key={option.value || 'all-reasons'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-ocean"
        >
          <ArrowPathIcon className="h-5 w-5 text-gold" />
          Refresh
        </button>
      </div>
    </div>
  )
}


function ReportStatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${
        STATUS_CLASSES[status] || STATUS_CLASSES.pending
      }`}
    >
      {label || status}
    </span>
  )
}


function ReportCard({ report, updatingId, noteValue, onNoteChange, onUpdateStatus }) {
  const target = report.target || {}
  const reporter = report.reporter || {}
  const isUpdating = updatingId === report.id

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ReportStatusBadge status={report.status} label={report.status_display} />

              <span className="rounded-full bg-navy px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-gold">
                {report.target_type}
              </span>

              <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                {report.reason_display || report.reason}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">
              {target.label || 'Unknown target'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Report #{report.id} · Created{' '}
              {formatDate(report.created_at, {
                dateOptions: {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                },
              })}
            </p>
          </div>

          {target.url ? (
            <Link
              to={target.url}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <EyeIcon className="h-5 w-5" />
              Open target
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
              Reporter
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {reporter.username || 'Unknown'}{' '}
              {reporter.email ? (
                <span className="font-medium text-slate-500">({reporter.email})</span>
              ) : null}
            </p>
          </div>

          {target.summary ? (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                Target content
              </p>
              <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-700">
                {target.summary}
              </p>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
              Report details
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
              {report.details || 'No extra details provided.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor={`admin-notes-${report.id}`}
              className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500"
            >
              Admin notes
            </label>

            <textarea
              id={`admin-notes-${report.id}`}
              value={noteValue}
              onChange={(event) => onNoteChange(report.id, event.target.value)}
              rows={5}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
              placeholder="Write what you checked and what action was taken..."
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(report, 'reviewing')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-extrabold text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              Reviewing
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(report, 'resolved')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Resolve
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(report, 'dismissed')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircleIcon className="h-5 w-5" />
              Dismiss
            </button>
          </div>

          {isUpdating ? (
            <p className="text-sm font-semibold text-slate-500">Updating report...</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}


export default function ModerationPage() {
  const { showToast } = useToast()

  const [stats, setStats] = useState(null)
  const [reportsData, setReportsData] = useState(() => toPaginatedData([]))
  const [filters, setFilters] = useState({
    q: '',
    status: 'pending',
    target_type: '',
    reason: '',
    page: 1,
  })
  const [notesById, setNotesById] = useState({})
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const queryParams = useMemo(() => ({
    q: filters.q,
    status: filters.status,
    target_type: filters.target_type,
    reason: filters.reason,
    page: filters.page,
  }), [filters])

  const loadData = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        getModerationReportStats(),
        getModerationReports(queryParams),
      ])

      const normalizedReports = toPaginatedData(reportsResponse, {
        fallbackPageSize: 12,
      })

      setStats(statsResponse)
      setReportsData(normalizedReports)

      setNotesById((current) => {
        const next = { ...current }

        normalizedReports.results.forEach((report) => {
          if (next[report.id] === undefined) {
            next[report.id] = report.admin_notes || ''
          }
        })

        return next
      })
    } catch (err) {
      const message = getErrorMessage(err, 'Could not load moderation reports.')
      setError(message)
      showToast({ tone: 'error', message })
    } finally {
      setLoading(false)
    }
  }, [queryParams, showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function handleNoteChange(reportId, value) {
    setNotesById((current) => ({
      ...current,
      [reportId]: value,
    }))
  }

  async function handleUpdateStatus(report, status) {
    setUpdatingId(report.id)

    try {
      const updatedReport = await updateModerationReport(report.id, {
        status,
        admin_notes: notesById[report.id] || '',
      })

      setReportsData((current) => ({
        ...current,
        results: current.results.map((item) => (
          item.id === report.id ? updatedReport : item
        )),
      }))

      setNotesById((current) => ({
        ...current,
        [updatedReport.id]: updatedReport.admin_notes || '',
      }))

      showToast({
        tone: 'success',
        title: 'Report updated',
        message: `Report marked as ${updatedReport.status_display || updatedReport.status}.`,
      })

      const latestStats = await getModerationReportStats()
      setStats(latestStats)
    } catch (err) {
      const message = getErrorMessage(err, 'Could not update report.')
      showToast({ tone: 'error', message })
    } finally {
      setUpdatingId(null)
    }
  }

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
        <StatCard
          label="Pending"
          value={stats?.pending}
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Reviewing"
          value={stats?.reviewing}
          icon={<ShieldCheckIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Dismissed"
          value={stats?.dismissed}
          icon={<XCircleIcon className="h-6 w-6" />}
        />
        <StatCard
          label="Total"
          value={stats?.total}
          icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
        />
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        onRefresh={() => void loadData()}
      />

      {loading ? (
        <LoadingState
          title="Loading reports"
          text="Fetching moderation queue..."
        />
      ) : error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-red-800">
          {error}
        </div>
      ) : reportsData.results.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 text-center shadow-soft">
          <p className="text-xl font-black text-slate-900">No reports found</p>
          <p className="mt-2 text-slate-600">
            Try changing the filters or search query.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {reportsData.results.map((report) => (
              <ReportCard
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