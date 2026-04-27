export default function MarineMetricCard({ label, value, unit }) {
  return (
    <div className="rounded-[24px] bg-mist p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value ?? '—'} {unit}
      </p>
    </div>
  )
}