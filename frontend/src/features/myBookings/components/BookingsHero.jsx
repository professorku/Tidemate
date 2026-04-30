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

export default function BookingsHero({ counts = {} }) {
  const items = [
    {
      label: 'Upcoming',
      value: counts.upcoming ?? 0,
      text: 'trips',
    },
    {
      label: 'Pending',
      value: counts.pending ?? 0,
      text: 'requests',
    },
    {
      label: 'Active',
      value: counts.active ?? 0,
      text: 'trips',
    },
    {
      label: 'Completed',
      value: counts.completed ?? 0,
      text: 'trips',
    },
  ]

  return (
    <SectionShell padding="hero">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <SectionHeader
          title="My bookings"
          description="Keep track of your upcoming trips, booking requests, completed stays, and any cancellations in one place."
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