export default function ProfileStatCard({ label, value }) {
  return (
    <div className="rounded-[24px] bg-mist p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
  )
}