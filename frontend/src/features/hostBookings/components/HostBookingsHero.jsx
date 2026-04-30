import SectionShell from '../../../components/ui/SectionShell'
import SectionHeader from '../../../components/ui/SectionHeader'

function HeroStat({ label, value, text }) {
  return (
    <div className="w-[108px] rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-1 flex items-end gap-1.5">
        <p className="text-2xl font-extrabold leading-none text-slate-950">
          {value}
        </p>

        <p className="pb-0.5 text-[11px] font-medium leading-none text-slate-500">
          {text}
        </p>
      </div>
    </div>
  )
}

export default function HostBookingsHero({ stats = {} }) {
  const items = [
    {
      label: 'Pending',
      value: stats.pending ?? 0,
      text: 'requests',
    },
    {
      label: 'Confirmed',
      value: stats.confirmed ?? 0,
      text: 'trips',
    },
    {
      label: 'Cancelled',
      value: stats.cancelled ?? 0,
      text: 'trips',
    },
    {
      label: 'Total',
      value: stats.all ?? 0,
      text: 'bookings',
    },
  ]

  return (
    <SectionShell padding="hero">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <SectionHeader
          title="Host bookings"
          description="Manage booking requests, confirmed trips, active rentals, and cancellations for boats you host."
          className="flex-1 xl:max-w-none"
        />

        <div className="flex flex-wrap gap-2.5 xl:shrink-0 xl:justify-end">
          {items.map((item) => (
            <HeroStat
              key={item.label}
              label={item.label}
              value={item.value}
              text={item.text}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  )
}