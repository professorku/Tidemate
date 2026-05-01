import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import PaginationControls from '../../../components/ui/PaginationControls'
import { useToast } from '../../../context/useToast'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { getErrorMessage } from '../../../utils/errors'
import MessagesFilters from '../../messages/components/MessagesFilters'
import MessagesHero from '../../messages/components/MessagesHero'
import MessagesResults from '../../messages/components/MessagesResults'
import useMessagesPageData from '../../messages/hooks/useMessagesPageData'

export default function MessagesPage() {
  const {
    conversations,
    currentUsername,
    counts,
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    filterTabs,
    reload,
    deletingConversationId,
    deleteConversation,
    canDeleteConversation,
    pagination,
    pageLoading,
    goToPreviousPage,
    goToNextPage,
  } = useMessagesPageData()

  const { openConfirm, modalProps } = useConfirmAction()
  const { showToast } = useToast()

  const requestDeleteConversation = (conversation) => {
    if (!canDeleteConversation(conversation)) {
      showToast({
        tone: 'info',
        message:
          'This conversation can only be deleted when the booking is cancelled or completed.',
      })
      return
    }

    openConfirm({
      title: 'Delete conversation?',
      message:
        'This removes the whole thread from the database for the conversation participants.',
      confirmLabel: 'Delete conversation',
      tone: 'danger',
      action: async () => {
        try {
          await deleteConversation(conversation)
        } catch (err) {
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Could not delete conversation.'),
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
          <MessagesHero totalCount={counts.all} unreadCount={counts.unread} />

          <section className="rounded-[34px] border border-white/15 bg-navy p-4 text-white shadow-soft md:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-gold">
                  Inbox
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
                  Your conversations
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  Keep booking questions, pickup details, and direct inquiries in one
                  place.
                </p>
              </div>

              <MessagesFilters
                search={search}
                onSearchChange={setSearch}
                filter={filter}
                onFilterChange={setFilter}
                filterTabs={filterTabs}
              />
            </div>

            <MessagesResults
              loading={loading || pageLoading}
              error={error}
              search={search}
              filter={filter}
              conversations={conversations}
              currentUsername={currentUsername}
              onRetry={reload}
              onDeleteConversation={requestDeleteConversation}
              deletingConversationId={deletingConversationId}
              canDeleteConversation={canDeleteConversation}
            />

            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              count={pagination.count}
              itemLabel="conversations"
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
              disabled={pageLoading}
            />
          </section>
        </PageContainer>
      </main>

      <ConfirmModal {...modalProps} />
    </>
  )
}