import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
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
    messageLoading,
    error,
    success,
    selectionError,
    handleDateClick,
    clearDates,
    startHostConversation,
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
      <BookingPriceCard>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="cursor-default rounded-[18px] border border-gold/20 bg-transparent p-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">
                Pickup
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {formatDateWithTime(form.start_date, pickupTime)}
              </p>
            </div>

            <div className="cursor-default rounded-[18px] border border-gold/20 bg-transparent p-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">
                Return
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white">
                {formatDateWithTime(form.end_date, returnTime)}
              </p>
            </div>
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
            <div className="rounded-xl border border-red-300/25 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-200">
              {error || selectionError}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-3.5 py-2.5 text-sm text-emerald-100">
              {success}
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={clearDates}
              className="rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Clear
            </button>

            <button
              disabled={loading || !!selectionError || !form.start_date || !form.end_date}
              className="flex-1 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:opacity-60"
            >
              {loading ? 'Sending request...' : 'Request booking'}
            </button>
          </div>

          <button
            type="button"
            onClick={startHostConversation}
            disabled={messageLoading || loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gold/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gold" />
            {messageLoading ? 'Opening chat...' : 'Message host about this boat'}
          </button>
        </form>
      </BookingPriceCard>

      <BookingInfoCard boat={boat} />
    </div>
  )
}