export default function InfoCard({ label, value, muted, icon, className = '' }) {
  return (
    <div className={`rounded-2xl bg-slate-50 px-4 py-3 ${className}`.trim()}>
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-navy ring-1 ring-slate-200">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1.5 break-words text-sm ${
              muted ? 'text-slate-600' : 'font-semibold text-slate-900'
            }`}
          >
            {value || 'Not available'}
          </p>
        </div>
      </div>
    </div>
  )
}