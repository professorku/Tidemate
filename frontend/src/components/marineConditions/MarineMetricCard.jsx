export default function MarineMetricCard({ label, value, unit }) {
  return (
    <div className="rounded-[24px] border border-gold/15 bg-[#071d32]/70 p-4">
      <p className="text-sm font-medium text-white/55">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">
        {value ?? '—'} {unit}
      </p>
    </div>
  )
}