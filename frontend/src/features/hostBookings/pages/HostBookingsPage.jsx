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

  const requestCancelBooking = (bookingId) => {
    openConfirm({
      title: 'Cancel booking as host?',
      message:
        'This will cancel the booking for the guest and send a notification. Add a reason first if you want the guest to see more context.',
      confirmLabel: 'Cancel booking',
      tone: 'warning',
      action: async () => {
        try {
          await cancelBooking(bookingId)
        } catch (err) {
          showToast({ tone: 'error', message: getErrorMessage(err, 'Could not cancel booking.') })
          throw err
        }
      },
    })
  }

  const requestDeleteBooking = (booking) => {
    openConfirm({
      title: 'Delete booking?',
      message: `Delete the booking for "${booking.boat_title || 'Boat'}"? This should only be used for cancelled or completed bookings.`,
      confirmLabel: 'Delete booking',
      tone: 'danger',
      action: async () => {
        try {
          await deleteBooking(booking)
        } catch (err) {
          showToast({ tone: 'error', message: getErrorMessage(err, 'Could not delete booking.') })
          throw err
        }
      },
    })
  }

  const safeConfirmBooking = async (bookingId) => {
    try {
      await confirmBooking(bookingId)
    } catch (err) {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not confirm booking.') })
    }
  }

  return (
    <>
      <PageContainer>
        <HostBookingsHero stats={safeStats} />

        <HostBookingsFilters
          activeTab={activeTab}
          stats={safeStats}
          onChange={setActiveTab}
        />

        <HostBookingsResults
          actionLoadingId={actionLoadingId}
          cancelReason={cancelReason}
          error={error}
          filteredBookings={Array.isArray(filteredBookings) ? filteredBookings : []}
          loading={loading}
          onCancel={requestCancelBooking}
          onConfirm={safeConfirmBooking}
          onDelete={requestDeleteBooking}
          canDeleteBooking={canDeleteBooking}
          onRetry={loadBookings}
          setCancelReason={setCancelReason}
        />

        {!loading && !error && filteredBookings.length > 0 ? (
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            count={pagination.count}
            itemLabel="bookings"
            onPrevious={() => setPage(pagination.page - 1)}
            onNext={() => setPage(pagination.page + 1)}
          />
        ) : null}
      </PageContainer>

      <ConfirmModal {...modalProps} />
    </>
  )
}