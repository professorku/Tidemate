import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import PaginationControls from '../../../components/ui/PaginationControls'
import BookingsFilters from '../../myBookings/components/BookingsFilters'
import BookingsHero from '../../myBookings/components/BookingsHero'
import BookingsResults from '../../myBookings/components/BookingsResults'
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
    pageLoading,
    pagination,
    setActiveTab,
    setPage,
  } = useMyBookingsPageData()

  const { openConfirm, modalProps } = useConfirmAction()

  const safeCounts = {
    all: counts?.all ?? 0,
    upcoming: counts?.upcoming ?? 0,
    active: counts?.active ?? 0,
    pending: counts?.pending ?? 0,
    completed: counts?.completed ?? 0,
    cancelled: counts?.cancelled ?? 0,
  }

  const requestCancelBooking = (booking) => {
    openConfirm({
      title: 'Cancel booking?',
      message: `Cancel the booking for "${booking.boat_title || 'this boat'}"? The host will be notified and the booking will stay visible in your cancelled trips.`,
      confirmLabel: 'Cancel booking',
      tone: 'warning',
      action: async () => {
        await cancelBooking(booking.id)
      },
    })
  }

  const requestDeleteBooking = (booking) => {
    openConfirm({
      title: 'Delete booking?',
      message: `Delete the booking for "${booking.boat_title || 'this boat'}"? This is meant for cancelled or completed trips and removes it from your list.`,
      confirmLabel: 'Delete booking',
      tone: 'danger',
      action: async () => {
        await deleteBooking(booking)
      },
    })
  }

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,76,107,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(201,161,74,0.16),_transparent_32%),linear-gradient(180deg,#f5f7fa_0%,#e8eef3_45%,#f5f7fa_100%)]">
        <PageContainer
          size="wide"
          as="div"
          className="py-7 md:py-10"
          contentClassName="space-y-7"
        >
          <BookingsHero counts={safeCounts} />

          <section className="overflow-hidden rounded-[34px] border border-navy/10 bg-white/90 p-4 shadow-soft backdrop-blur md:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
                  Trip overview
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
                  Your booking timeline
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-ocean">
                  View your booking requests, active trips, completed rentals and
                  cancellations in one clean place.
                </p>
              </div>

              <BookingsFilters
                activeTab={activeTab}
                counts={safeCounts}
                onChange={setActiveTab}
              />
            </div>

            <BookingsResults
              activeTab={activeTab}
              cancellingId={cancellingId}
              deletingId={deletingId}
              error={error}
              filteredBookings={filteredBookings}
              loading={loading || pageLoading}
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