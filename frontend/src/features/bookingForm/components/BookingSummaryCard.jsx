import { formatDateWithTime } from '../utils/bookingDateUtils'

function getPolicyTime(policy, key) {
  return policy && typeof policy === 'object' ? policy[key] : null
}

function getPolicyText(policy) {
  if (!policy || typeof policy !== 'object') {
    return 'Rental timing is loaded from the backend booking policy.'
  }

  return policy.short_text || policy.display_text || 'Rental timing is loaded from the backend booking policy.'
}

export default function BookingSummaryCard({ preview, form, rentalPolicy }) {
  if (!preview) {
    return (
      <div className="rounded-[18px] border border-gold/15 bg-[#071d32]/70 p-4 text-sm text-white/65">
        Select your start and end dates to see the total price.
      </div>
    )
  }

  const pickupTime = getPolicyTime(rentalPolicy, 'pickup_time') || 'policy time'
  const returnTime = getPolicyTime(rentalPolicy, 'return_time') || 'policy time'

  return (
    <div className="rounded-[18px] border border-gold/20 bg-[#071d32]/70 p-4">
      <h3 className="text-base font-bold text-white">Trip summary</h3>

      <div className="mt-3 space-y-2.5 text-sm text-white/70">
        <div className="flex items-center justify-between gap-4">
          <span>Pickup</span>
          <span className="text-right font-semibold text-white">
            {formatDateWithTime(form.start_date, pickupTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Return</span>
          <span className="text-right font-semibold text-white">
            {formatDateWithTime(form.end_date, returnTime)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Rental length</span>
          <span className="font-semibold text-white">{preview.days} day(s)</span>
        </div>

        <div className="flex items-center justify-between">
          <span>
            {preview.pricePerDay} kr × {preview.days}
          </span>
          <span className="font-semibold text-white">{preview.total} kr</span>
        </div>

        <div className="rounded-2xl border border-gold/15 bg-navy px-3 py-2 text-xs text-white/65">
          {getPolicyText(rentalPolicy)}
        </div>

        <div className="border-t border-gold/15 pt-2.5">
          <div className="flex items-center justify-between font-bold text-white">
            <span>Total</span>
            <span>{preview.total} kr</span>
          </div>
        </div>
      </div>
    </div>
  )
}