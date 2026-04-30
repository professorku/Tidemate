import {
  ExclamationTriangleIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import PaginationControls from '../../../components/ui/PaginationControls'
import MyBoatsGrid from '../../myBoats/components/MyBoatsGrid'
import MyBoatsHero from '../../myBoats/components/MyBoatsHero'
import MyBoatsStats from '../../myBoats/components/MyBoatsStats'
import PendingRequestsPanel from '../../myBoats/components/PendingRequestsPanel'
import useMyBoatsPageData from '../../myBoats/hooks/useMyBoatsPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

export default function MyBoatsPage() {
  const {
    boats,
    loading,
    error,
    deletingId,
    deleteBoat,
    pagination,
    setPage,
    reload,
    stats,
    statsLoading,
    statsError,
    pendingRequests,
    pendingRequestsLoading,
    pendingRequestsError,
    refreshHostActivity,
  } = useMyBoatsPageData()

  const { openConfirm, modalProps } = useConfirmAction()
  const { showToast } = useToast()

  const requestDeleteBoat = (boatId, boatTitle = 'this boat') => {
    openConfirm({
      title: 'Delete boat?',
      message: `Delete "${boatTitle}"? This permanently removes the boat and related bookings, conversations, and messages from the database.`,
      confirmLabel: 'Delete boat',
      tone: 'danger',
      action: async () => {
        try {
          await deleteBoat(boatId)
        } catch (err) {
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Failed to delete boat.'),
          })
          throw err
        }
      },
    })
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
        <PageContainer
          size="wide"
          as="div"
          className="py-8 md:py-10"
          contentClassName="space-y-6"
        >
          <MyBoatsHero
            totalBoats={pagination.count}
            pendingCount={stats.pending}
            confirmedCount={stats.confirmed}
          />

          <MyBoatsStats
            totalBoats={pagination.count}
            stats={stats}
            loading={statsLoading}
          />

          {statsError ? (
            <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Could not load all dashboard stats</p>
                <p className="mt-1 leading-6">{statsError}</p>
              </div>
            </div>
          ) : null}

          <PendingRequestsPanel
            requests={pendingRequests}
            loading={pendingRequestsLoading}
            error={pendingRequestsError}
            onRetry={refreshHostActivity}
          />

          <section className="rounded-[32px] border border-slate-200 bg-white/85 p-4 shadow-sm md:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
                  Your fleet
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  Boat listings
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  View, edit, and manage the boats renters can book from you.
                </p>
              </div>

              <Link
                to="/add-boat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-ocean"
              >
                <PlusIcon className="h-5 w-5" />
                Add new boat
              </Link>
            </div>

            {loading ? (
              <LoadingState
                title="Loading your boats"
                text="We are pulling in your listings and preparing the management view."
              />
            ) : null}

            {error ? (
              <ErrorState
                title="Could not load your boats"
                message={error}
                onRetry={reload}
              />
            ) : null}

            {!loading && !error && boats.length === 0 ? (
              <EmptyState
                icon={<Squares2X2Icon className="h-8 w-8" />}
                title="You have not added any boats yet"
                text="Create your first listing to start hosting, receiving requests, and managing bookings in one place."
                actionLabel="Create your first listing"
                actionTo="/add-boat"
                compact={false}
              />
            ) : null}

            {!loading && !error && boats.length > 0 ? (
              <>
                <MyBoatsGrid
                  boats={boats}
                  onDelete={requestDeleteBoat}
                  deletingId={deletingId}
                />

                <PaginationControls
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  count={pagination.count}
                  itemLabel="boats"
                  onPrevious={() => setPage(pagination.page - 1)}
                  onNext={() => setPage(pagination.page + 1)}
                />
              </>
            ) : null}
          </section>
        </PageContainer>
      </main>

      <ConfirmModal {...modalProps} />
    </>
  )
}