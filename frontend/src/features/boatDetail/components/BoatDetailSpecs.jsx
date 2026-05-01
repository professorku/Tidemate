import {
  CurrencyDollarIcon,
  PhotoIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  formatMoney,
  formatRatingSummary,
  getGuestLabel,
  getImageCount,
} from '../utils/boatDetailFormatters'

function SpecCard({ icon, label, value, text }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
          {text ? <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default function BoatDetailSpecs({ boat, reviewsData }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SpecCard
        icon={<CurrencyDollarIcon className="h-5 w-5" />}
        label="Day price"
        value={formatMoney(boat.price_per_day)}
        text="Final price is calculated from selected dates."
      />

      <SpecCard
        icon={<UserGroupIcon className="h-5 w-5" />}
        label="Capacity"
        value={getGuestLabel(boat.guests)}
        text="Maximum number of guests for this listing."
      />

      <SpecCard
        icon={<PhotoIcon className="h-5 w-5" />}
        label="Photos"
        value={getImageCount(boat)}
        text="Images uploaded by the host."
      />

      <SpecCard
        icon={<ShieldCheckIcon className="h-5 w-5" />}
        label="Reviews"
        value={formatRatingSummary(reviewsData)}
        text="Feedback from previous renters."
      />
    </section>
  )
}