export default function InfoCard({ label, value, muted }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm ${
          muted ? 'text-slate-600' : 'font-semibold text-slate-900'
        }`}
      >
        {value}
      </p>
    </div>
  )
}