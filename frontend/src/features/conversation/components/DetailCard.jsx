import { Link } from 'react-router-dom'

export default function DetailCard({ icon, label, value, to }) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="block transition hover:-translate-y-0.5">
        {content}
      </Link>
    )
  }

  return content
}
