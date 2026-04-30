import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import StatePanel from '../../../components/ui/StatePanel'
import BookingHero from '../../bookingDetail/components/BookingHero'
import TripDetailsCard from '../../bookingDetail/components/TripDetailsCard'
import HostCard from '../../bookingDetail/components/HostCard'
import CancellationDetails from '../../bookingDetail/components/CancellationDetails'
import BookingSummaryCard from '../../bookingDetail/components/BookingSummaryCard'
import CancelBookingCard from '../../bookingDetail/components/CancelBookingCard'
import BookingReviewCard from '../../bookingDetail/components/BookingReviewCard'
import { useBookingDetail } from '../../bookingDetail/hooks/useBookingDetail'
import { getBackLinkForViewer } from '../../bookingDetail/utils/bookingFormatters'

function BookingDetailSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
      <PageContainer size="wide" as="div" className="py-8 md:py-10">
        <div className="h-10 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-5 h-[360px] animate-pulse rounded-[34px] bg-slate-200" />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="h-96 animate-pulse rounded-[30px] bg-slate-100" />
            <div className="h-36 animate-pulse rounded-[30px] bg-slate-100" />
          </div>
          <div className="h-[520px] animate-pulse rounded-[30px] bg-slate-100" />
        </div>
      </PageContainer>
    </main>
  )
}

export default function BookingDetailPage() {
  const navigate = useNavigate()

  const {
    booking,
    viewerRole,
    loading,
    error,
    cancelReason,
    setCancelReason,
    actionLoading,
    confirming,
    cancelling,
    summaryText,
    handleConfirm,
    handleCancel,
    reloadBooking,
  } = useBookingDetail()

  const backLink = getBackLinkForViewer(viewerRole)

  if (loading) {
    return <BookingDetailSkeleton />
  }

  if (error || !booking) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
        <PageContainer size="content" className="py-8 md:py-10">
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
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to my bookings
              </button>
            </div>
          ) : null}
        </PageContainer>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
      <PageContainer
        size="wide"
        as="div"
        className="py-8 md:py-10"
        contentClassName="space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={backLink.to}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {backLink.label}
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            <CalendarDaysIcon className="h-4 w-4 text-navy" />
            Booking #{booking.id}
          </div>
        </div>

        <BookingHero
          booking={booking}
          summaryText={summaryText}
          viewerRole={viewerRole}
        />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <TripDetailsCard booking={booking} />
            <HostCard booking={booking} viewerRole={viewerRole} />

            {booking.status === 'cancelled' ? (
              <CancellationDetails booking={booking} />
            ) : null}

            <BookingReviewCard booking={booking} onRefresh={reloadBooking} />
          </div>

          <aside className="space-y-5">
            <BookingSummaryCard booking={booking} />

            {booking.can_confirm || booking.can_cancel ? (
              <CancelBookingCard
                booking={booking}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
                actionLoading={actionLoading}
                confirming={confirming}
                cancelling={cancelling}
                handleConfirm={handleConfirm}
                handleCancel={handleCancel}
              />
            ) : null}
          </aside>
        </section>
      </PageContainer>
    </main>
  )
}