import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import PaginationControls from '../../../components/ui/PaginationControls'
import MyBoatsGrid from '../../myBoats/components/MyBoatsGrid'
import MyBoatsHero from '../../myBoats/components/MyBoatsHero'
import useMyBoatsPageData from '../../myBoats/hooks/useMyBoatsPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

export default function MyBoatsPage() {
  const { boats, loading, error, deletingId, deleteBoat, pagination, setPage, reload } = useMyBoatsPageData()
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
          showToast({ tone: 'error', message: getErrorMessage(err, 'Failed to delete boat.') })
          throw err
        }
      },
    })
  }

  return (
    <>
      <PageContainer>
        <MyBoatsHero totalBoats={pagination.count} />

        {loading ? <LoadingState title="Loading your boats" text="We are pulling in your listings and preparing the management view." /> : null}
        {error ? <ErrorState title="Could not load your boats" message={error} onRetry={reload} /> : null}
        {!loading && !error && boats.length === 0 ? <EmptyState title="You have not added any boats yet" text="Create your first listing to start hosting, receiving inquiries, and managing bookings in one place." actionLabel="Create your first listing" actionTo="/add-boat" /> : null}
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
      </PageContainer>

      <ConfirmModal {...modalProps} />
    </>
  )
}
