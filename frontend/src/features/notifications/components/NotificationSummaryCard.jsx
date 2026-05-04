export default function NotificationSummaryCard({ icon, label, value, text }) {
  return (
    <div className="rounded-[24px] border border-gold/20 bg-navy p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/60">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
          {icon}
        </div>
      </div>

      {text ? <p className="mt-3 text-sm leading-6 text-white/55">{text}</p> : null}
    </div>
  )
}