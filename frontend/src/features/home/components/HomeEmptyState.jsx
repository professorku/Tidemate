export default function HomeEmptyState() {
  return (
    <div className="rounded-[20px] bg-white p-6 shadow-soft">
      <p className="text-base font-semibold text-slate-900">No boats found.</p>
      <p className="mt-1.5 text-sm text-slate-600">
        Try another search or clear the filters.
      </p>
    </div>
  )
}