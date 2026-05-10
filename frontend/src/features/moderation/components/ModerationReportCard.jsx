import { Link } from 'react-router-dom'
import {
  CheckCircleIcon,
  EyeIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '../../../utils/format/date'
import ModerationStatusBadge from './ModerationStatusBadge'

export default function ModerationReportCard({
  report,
  updatingId,
  noteValue,
  onNoteChange,
  onUpdateStatus,
}) {
  const target = report.target || {}
  const reporter = report.reporter || {}
  const isUpdating = updatingId === report.id

  return (
    <article className="overflow-hidden rounded-[28px] border border-gold/20 bg-navy text-white shadow-soft">
      <div className="border-b border-gold/10 bg-[#071d32]/80 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ModerationStatusBadge
                status={report.status}
                label={report.status_display}
              />

              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-gold ring-1 ring-gold/20">
                {report.target_type}
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/75 ring-1 ring-white/10">
                {report.reason_display || report.reason}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-black tracking-tight text-white">
              {target.label || 'Unknown target'}
            </h2>

            <p className="mt-1 text-sm text-white/50">
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
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/20 bg-[#071d32] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean"
            >
              <EyeIcon className="h-5 w-5 text-gold" />
              Open target
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
              Reporter
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {reporter.username || 'Unknown'}{' '}
              {reporter.email ? (
                <span className="font-medium text-white/50">
                  ({reporter.email})
                </span>
              ) : null}
            </p>
          </div>

          {target.summary ? (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
                Target content
              </p>

              <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white/75">
                {target.summary}
              </p>
            </div>
          ) : null}

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">
              Report details
            </p>

            <p className="mt-2 whitespace-pre-wrap rounded-2xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-50">
              {report.details || 'No extra details provided.'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor={`admin-notes-${report.id}`}
              className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold"
            >
              Admin notes
            </label>

            <textarea
              id={`admin-notes-${report.id}`}
              value={noteValue}
              onChange={(event) => onNoteChange(report.id, event.target.value)}
              rows={5}
              className="mt-2 w-full resize-none rounded-2xl border border-gold/20 bg-[#071d32] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-gold focus:ring-4 focus:ring-gold/15"
              placeholder="Write what you checked and what action was taken..."
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(report, 'reviewing')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-sky-300/25 bg-sky-400/10 px-4 py-2.5 text-sm font-extrabold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheckIcon className="h-5 w-5" />
              Reviewing
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(report, 'resolved')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2.5 text-sm font-extrabold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Resolve
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(report, 'dismissed')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white/75 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircleIcon className="h-5 w-5" />
              Dismiss
            </button>
          </div>

          {isUpdating ? (
            <p className="text-sm font-semibold text-white/50">
              Updating report...
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}