import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import PaginationControls from '../../../components/ui/PaginationControls'
import HostBookingsFilters from '../../hostBookings/components/HostBookingsFilters'
import HostBookingsHero from '../../hostBookings/components/HostBookingsHero'
import HostBookingsResults from '../../hostBookings/components/HostBookingsResults'
import useHostBookingsPageData from '../../hostBookings/hooks/useHostBookingsPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

export default function HostBookingsPage() {
  const {
    activeTab,
    actionLoadingId,
    cancelReason,
    error,
    filteredBookings,
    cancelBooking,
    confirmBooking,
    deleteBooking,
    canDeleteBooking,
    loadBookings,
    loading,
    pageLoading,
    pagination,
    setActiveTab,
    setCancelReason,
    setPage,
    stats,
  } = useHostBookingsPageData()

  const { openConfirm, modalProps } = useConfirmAction()
  const { showToast } = useToast()

  const safeStats = {
    all: stats?.all ?? 0,
    pending: stats?.pending ?? 0,
    confirmed: stats?.confirmed ?? 0,
    cancelled: stats?.cancelled ?? 0,
  }

  const requestConfirmBooking = (booking) => {
    openConfirm({
      title: 'Confirm booking?',
      message: `Confirm the booking request for "${booking.boat_title || 'this boat'}"? Any overlapping pending requests for the same dates may be cancelled automatically.`,
      confirmLabel: 'Confirm booking',
      tone: 'success',
      action: async () => {
        try {
          await confirmBooking(booking.id)
          showToast({ tone: 'success', message: 'Booking confirmed.' })
        } catch (err) {
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Could not confirm booking.'),
          })
          throw err
        }
      },
    })
  }

  const requestCancelBooking = (booking) => {
    openConfirm({
      title: 'Cancel booking as host?',
      message:
        'This will cancel the booking for the renter and send a notification. Add a short reason first if you want the renter to see more context.',
      confirmLabel: 'Cancel booking',
      tone: 'warning',
      action: async () => {
        try {
          await cancelBooking(booking.id)
          showToast({ tone: 'success', message: 'Booking cancelled.' })
        } catch (err) {
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Could not cancel booking.'),
          })
          throw err
        }
      },
    })
  }

  const requestDeleteBooking = (booking) => {
    openConfirm({
      title: 'Delete booking?',
      message: `Delete the booking for "${booking.boat_title || 'this boat'}"? This should only be used for cancelled or completed bookings.`,
      confirmLabel: 'Delete booking',
      tone: 'danger',
      action: async () => {
        try {
          await deleteBooking(booking)
          showToast({ tone: 'success', message: 'Booking deleted.' })
        } catch (err) {
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Could not delete booking.'),
          })
          throw err
        }
      },
    })
  }

  const bookings = Array.isArray(filteredBookings) ? filteredBookings : []

  return (
    <>
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer
          size="wide"
          as="div"
          className="py-8 md:py-10"
          contentClassName="space-y-7"
        >
          <HostBookingsHero stats={safeStats} />

          <section className="rounded-[34px] border border-white/15 bg-navy p-4 text-white shadow-soft md:p-6">
  <div className="mb-6 space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
                  Booking management
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                  Host booking requests
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  View your booking requests, active trips, completed rentals and
                  cancellations in one clean place.
                </p>
              </div>

              <HostBookingsFilters
                activeTab={activeTab}
                stats={safeStats}
                onChange={setActiveTab}
              />
            </div>

            <HostBookingsResults
              actionLoadingId={actionLoadingId}
              cancelReason={cancelReason}
              error={error}
              filteredBookings={bookings}
              loading={loading || pageLoading}
              onCancel={requestCancelBooking}
              onConfirm={requestConfirmBooking}
              onDelete={requestDeleteBooking}
              canDeleteBooking={canDeleteBooking}
              onRetry={loadBookings}
              setCancelReason={setCancelReason}
              activeTab={activeTab}
            />

            {!loading && !error && bookings.length > 0 ? (
              <PaginationControls
                page={pagination.page}
                totalPages={pagination.totalPages}
                count={pagination.count}
                itemLabel="bookings"
                onPrevious={() => setPage(pagination.page - 1)}
                onNext={() => setPage(pagination.page + 1)}
                disabled={pageLoading}
              />
            ) : null}
          </section>
        </PageContainer>
      </main>

      <ConfirmModal {...modalProps} />
    </>
  )
}