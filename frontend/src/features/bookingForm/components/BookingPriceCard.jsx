export default function BookingPriceCard({ boat, children }) {
  return (
    <div className="rounded-[22px] border border-gold/20 bg-navy p-4 shadow-soft md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold text-white">
            {boat?.price_per_day} kr
          </p>
          <p className="mt-0.5 text-xs text-white/55">per day</p>
        </div>

        <div className="rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-navy">
          Request to book
        </div>
      </div>

      {children}
    </div>
  )
}