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
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <PageContainer
          size="wide"
          as="div"
          className="py-8 md:py-10"
          contentClassName="space-y-6"
        >
          <BookingsHero counts={safeCounts} />

          <BookingsStats counts={safeCounts} loading={loading} />

          <section className="rounded-[32px] border border-slate-200 bg-white/90 p-4 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
                  Trip overview
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  Your booking timeline
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Check pending requests, upcoming trips, active rentals, completed trips,
                  and cancellations in one clean view.
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