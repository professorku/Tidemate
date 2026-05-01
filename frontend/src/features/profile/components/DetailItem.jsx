export default function DetailItem({ icon, label, value, empty = false }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        empty
          ? 'border-gold/40 bg-gold/15'
          : 'border-white/15 bg-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ${
            empty
              ? 'bg-gold text-navy ring-gold/40'
              : 'bg-gold text-navy ring-gold/40'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-gold">
            {label}
          </p>

          <p
            className={`mt-1 break-words text-sm font-semibold ${
              empty ? 'text-white/80' : 'text-white'
            }`}
          >
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}