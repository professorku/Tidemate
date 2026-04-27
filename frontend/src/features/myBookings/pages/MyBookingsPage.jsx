import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import PaginationControls from '../../../components/ui/PaginationControls'
import BookingsFilters from '../../myBookings/components/BookingsFilters'
import BookingsHero from '../../myBookings/components/BookingsHero'
import BookingsResults from '../../myBookings/components/BookingsResults'
import BookingsStats from '../../myBookings/components/BookingsStats'
import useMyBookingsPageData from '../../myBookings/hooks/useMyBookingsPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'

export default function MyBookingsPage() {
  const {
    activeTab,
    cancellingId,
    deletingId,
    counts,
    error,
    filteredBookings,
    cancelBooking,
    deleteBooking,
    loadBookings,
    loading,
    pagination,
    setActiveTab,
    setPage,
  } = useMyBookingsPageData()
  const { openConfirm, modalProps } = useConfirmAction()

  const requestCancelBooking = (bookingId) => {
    openConfirm({
      title: 'Cancel booking?',
      message: 'This will cancel the booking and notify the host. You can still view the booking afterward.',
      confirmLabel: 'Cancel booking',
      tone: 'warning',
      action: async () => {
        await cancelBooking(bookingId)
      },
    })
  }

  const requestDeleteBooking = (booking) => {
    openConfirm({
      title: 'Delete booking?',
      message: `Delete the booking for "${booking.boat_title || 'Boat'}"? This is meant for cancelled or completed trips and removes it from your list.`,
      confirmLabel: 'Delete booking',
      tone: 'danger',
      action: async () => {
        await deleteBooking(booking)
      },
    })
  }

  return (
    <>
      <PageContainer>
        <BookingsHero />

        <BookingsStats counts={counts} />

        <BookingsFilters activeTab={activeTab} counts={counts} onChange={setActiveTab} />

        <BookingsResults
          activeTab={activeTab}
          cancellingId={cancellingId}
          deletingId={deletingId}
          error={error}
          filteredBookings={filteredBookings}
          loading={loading}
          onCancel={requestCancelBooking}
          onDelete={requestDeleteBooking}
          onRefresh={loadBookings}
          onRetry={loadBookings}
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
