export default function BookingPriceCard({ boat, children }) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-soft md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold text-slate-900">
            {boat?.price_per_day} kr
          </p>
          <p className="mt-0.5 text-xs text-slate-500">per day</p>
        </div>

        <div className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-slate-700">
          Request to book
        </div>
      </div>

      {children}
    </div>
  )
}