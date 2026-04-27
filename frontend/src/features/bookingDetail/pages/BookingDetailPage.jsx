import { CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import StatePanel from '../../../components/ui/StatePanel'
import BookingHero from '../../bookingDetail/components/BookingHero'
import TripDetailsCard from '../../bookingDetail/components/TripDetailsCard'
import HostCard from '../../bookingDetail/components/HostCard'
import CancellationDetails from '../../bookingDetail/components/CancellationDetails'
import BookingSummaryCard from '../../bookingDetail/components/BookingSummaryCard'
import CancelBookingCard from '../../bookingDetail/components/CancelBookingCard'
import { useBookingDetail } from '../../bookingDetail/hooks/useBookingDetail'

export default function BookingDetailPage() {
  const navigate = useNavigate()

  const {
    booking,
    loading,
    error,
    cancelReason,
    setCancelReason,
    actionLoading,
    summaryText,
    handleCancel,
    reloadBooking,
  } = useBookingDetail()

  if (loading) {
    return (
      <PageContainer size="content">
        <StatePanel
          icon={<CalendarDaysIcon className="h-8 w-8" />}
          title="Loading booking"
          text="We are fetching your trip details, host information, and booking summary."
          tone="subtle"
          compact
        />
      </PageContainer>
    )
  }

  if (error || !booking) {
    return (
      <PageContainer size="content">
        <StatePanel
          icon={<ExclamationTriangleIcon className="h-8 w-8" />}
          title="Booking unavailable"
          text={error || 'Booking not found.'}
          actionLabel={booking ? 'Try again' : 'Back to my bookings'}
          onAction={booking ? reloadBooking : undefined}
          actionTo={!booking ? '/my-bookings' : undefined}
          tone="error"
          compact
        />

        {!booking ? (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => navigate('/my-bookings')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to my bookings
            </button>
          </div>
        ) : null}
      </PageContainer>
    )
  }

  return (
    <PageContainer size="content">
      <div className="mb-4">
        <Link
          to="/my-bookings"
          className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to my bookings
        </Link>
      </div>

      <BookingHero booking={booking} summaryText={summaryText} />

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-5">
          <TripDetailsCard booking={booking} />
          <HostCard booking={booking} />

          {booking.status === 'cancelled' && (
            <CancellationDetails booking={booking} />
          )}
        </div>

        <aside className="space-y-5">
          <BookingSummaryCard booking={booking} />

          {booking.can_cancel && (
            <CancelBookingCard
              cancelReason={cancelReason}
              setCancelReason={setCancelReason}
              actionLoading={actionLoading}
              handleCancel={handleCancel}
            />
          )}
        </aside>
      </section>
    </PageContainer>
  )
}
