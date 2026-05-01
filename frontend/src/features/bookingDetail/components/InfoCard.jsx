export default function InfoCard({ label, value, muted, icon, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-gold/15 bg-[#071d32]/70 px-4 py-3 ${className}`.trim()}
    >
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy text-gold ring-1 ring-gold/20">
            {icon}
          </div>
        ) : null}

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">
            {label}
          </p>

          <p
            className={`mt-1.5 break-words text-sm ${
              muted ? 'text-white/60' : 'font-semibold text-white'
            }`}
          >
            {value || 'Not available'}
          </p>
        </div>
      </div>
    </div>
  )
}