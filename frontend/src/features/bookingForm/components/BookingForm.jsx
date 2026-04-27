import AvailabilityCalendar from '../../availabilityCalendar/components/AvailabilityCalendar'
import { formatDateWithTime } from '../utils/bookingDateUtils'
import { useBookingForm } from '../hooks/useBookingForm'
import BookingPriceCard from './BookingPriceCard'
import BookingSummaryCard from './BookingSummaryCard'
import BookingInfoCard from './BookingInfoCard'

export default function BookingForm(props) {
  const {
    form,
    preview,
    loading,
    error,
    success,
    selectionError,
    handleDateClick,
    clearDates,
    submitBooking,
  } = useBookingForm(props)

  const { boat } = props
  const rentalPolicy = boat?.rental_policy
  const pickupTime = rentalPolicy?.pickup_time || '15:00'
  const returnTime = rentalPolicy?.return_time || '12:00'

  const handleSubmit = (e) => {
    e.preventDefault()
    submitBooking()
  }

  return (
    <div className="space-y-4">
      <BookingPriceCard boat={boat}>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              className="rounded-[18px] border border-slate-200 p-3 text-left"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Pickup
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900">
                {formatDateWithTime(form.start_date, pickupTime)}
              </p>
            </button>

            <button
              type="button"
              className="rounded-[18px] border border-slate-200 p-3 text-left"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Return
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-900">
                {formatDateWithTime(form.end_date, returnTime)}
              </p>
            </button>
          </div>

          <AvailabilityCalendar
            blockedRanges={boat?.blocked_ranges || []}
            selectedStartDate={form.start_date}
            selectedEndDate={form.end_date}
            onDateClick={handleDateClick}
            interactive
            monthsToShow={1}
            title="Choose your dates"
            subtitle={`Click once for pickup date, then again for return date. Pickup is at ${pickupTime}, return is at ${returnTime}.`}
          />

          <BookingSummaryCard
            preview={preview}
            form={form}
            rentalPolicy={rentalPolicy}
          />

          {(error || selectionError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error || selectionError}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={clearDates}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Clear
            </button>

            <button
              disabled={loading || !!selectionError || !form.start_date || !form.end_date}
              className="flex-1 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy disabled:opacity-60"
            >
              {loading ? 'Sending request...' : 'Request booking'}
            </button>
          </div>
        </form>
      </BookingPriceCard>

      <BookingInfoCard boat={boat} />
    </div>
  )
}