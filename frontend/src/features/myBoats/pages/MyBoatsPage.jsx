import {
  ExclamationTriangleIcon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import PaginationControls from '../../../components/ui/PaginationControls'
import { BoatCardSkeletonGrid } from '../../../components/ui/Skeleton'
import MyBoatsGrid from '../../myBoats/components/MyBoatsGrid'
import MyBoatsHero from '../../myBoats/components/MyBoatsHero'
import useMyBoatsPageData from '../../myBoats/hooks/useMyBoatsPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

function PanelState({ icon, title, text, children }) {
  return (
    <div className="rounded-[30px] border border-white/15 bg-[#071d32] px-6 py-10 text-center text-white shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
        {icon}
      </div>

      <h3 className="mt-5 text-2xl font-black tracking-tight text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
        {text}
      </p>

      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  )
}

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
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer
          size="wide"
          as="div"
          className="py-8 md:py-10"
          contentClassName="space-y-7"
        >
          <MyBoatsHero totalBoats={pagination.count} />

          <section className="rounded-[34px] border border-white/15 bg-navy p-4 text-white shadow-soft md:p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
                  Your fleet
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                  Boat listings
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  View, edit, and manage the boats renters can book from you.
                </p>
              </div>

              <Link
                to="/add-boat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
              >
                <PlusIcon className="h-5 w-5" />
                Add new boat
              </Link>
            </div>

            {loading ? <BoatCardSkeletonGrid count={4} /> : null}

            {error ? (
              <PanelState
                icon={<ExclamationTriangleIcon className="h-8 w-8" />}
                title="Could not load your boats"
                text={error}
              >
                <button
                  type="button"
                  onClick={reload}
                  className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
                >
                  Try again
                </button>
              </PanelState>
            ) : null}

            {!loading && !error && boats.length === 0 ? (
              <PanelState
                icon={<Squares2X2Icon className="h-8 w-8" />}
                title="You have not added any boats yet"
                text="Create your first listing to start hosting, receiving requests, and managing bookings in one place."
              >
                <Link
                  to="/add-boat"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
                >
                  <PlusIcon className="h-5 w-5" />
                  Create your first listing
                </Link>
              </PanelState>
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