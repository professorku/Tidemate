export default function DetailItem({ icon, label, value, empty = false }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        empty
          ? 'border-amber-200 bg-amber-50'
          : 'border-slate-100 bg-slate-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${
            empty
              ? 'text-amber-700 ring-amber-100'
              : 'text-navy ring-slate-200'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className={`text-[11px] font-bold uppercase tracking-wide ${
              empty ? 'text-amber-700' : 'text-slate-500'
            }`}
          >
            {label}
          </p>
          <p
            className={`mt-1 break-words text-sm font-semibold ${
              empty ? 'text-amber-900' : 'text-slate-900'
            }`}
          >
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}