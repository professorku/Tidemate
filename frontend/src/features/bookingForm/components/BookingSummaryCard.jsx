import { formatDateWithTime } from '../utils/bookingDateUtils'

export default function BookingSummaryCard({ preview, form, rentalPolicy }) {
  if (!preview) {
    return (
      <div className="rounded-[18px] bg-slate-50 p-4 text-sm text-slate-600">
        Select your start and end dates to see the total price.
      </div>
    )
  }

  const pickupTime = rentalPolicy?.pickup_time || '15:00'
  const returnTime = rentalPolicy?.return_time || '12:00'

  return (
    <div className="rounded-[18px] bg-mist p-4">
      <h3 className="text-base font-bold text-slate-900">Trip summary</h3>

      <div className="mt-3 space-y-2.5 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <span>Pickup</span>
          <span className="text-right font-semibold">
            {formatDateWithTime(form.start_date, pickupTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span>Return</span>
          <span className="text-right font-semibold">
            {formatDateWithTime(form.end_date, returnTime)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Rental length</span>
          <span className="font-semibold">{preview.days} day(s)</span>
        </div>

        <div className="flex items-center justify-between">
          <span>
            {preview.pricePerDay} kr × {preview.days}
          </span>
          <span className="font-semibold">{preview.total} kr</span>
        </div>

        <div className="rounded-2xl bg-white/70 px-3 py-2 text-xs text-slate-600">
          {rentalPolicy?.short_text ||
            'Pickup is at 15:00 on the first day and return is at 12:00 on the last day.'}
        </div>

        <div className="border-t border-slate-200 pt-2.5">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>Total</span>
            <span>{preview.total} kr</span>
          </div>
        </div>
      </div>
    </div>
  )
}