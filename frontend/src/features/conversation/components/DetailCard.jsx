import { Link } from 'react-router-dom'

export default function DetailCard({ icon, label, value, to }) {
  const content = (
    <div className="rounded-2xl border border-white/15 bg-navy p-4 text-white shadow-sm transition hover:bg-ocean">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-white">
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