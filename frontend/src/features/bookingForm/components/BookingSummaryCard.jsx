import { formatDateWithTime } from '../utils/bookingDateUtils'

export default function BookingSummaryCard({ preview, form, rentalPolicy }) {
  if (!preview) {
    return (
      <div className="rounded-[18px] border border-gold/15 bg-[#071d32]/70 p-4 text-sm text-white/65">
        Select your start and end dates to see the total price.
      </div>
    )
  }

  const pickupTime = rentalPolicy?.pickup_time || '15:00'
  const returnTime = rentalPolicy?.return_time || '12:00'

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
          {rentalPolicy?.short_text ||
            'Pickup is at 15:00 on the first day and return is at 12:00 on the last day.'}
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