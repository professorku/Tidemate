import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import MessagesHero from '../../messages/components/MessagesHero'
import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import MessagesFilters from '../../messages/components/MessagesFilters'
import MessagesResults from '../../messages/components/MessagesResults'
import PaginationControls from '../../../components/ui/PaginationControls'
import StatCard from '../../../components/ui/StatCard'
import useMessagesPageData from '../../messages/hooks/useMessagesPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

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
      showToast({ tone: 'info', message: 'This conversation can only be deleted when the booking is cancelled or completed.' })
      return
    }

    openConfirm({
      title: 'Delete conversation?',
      message: 'This removes the whole thread from the database for the conversation participants.',
      confirmLabel: 'Delete conversation',
      tone: 'danger',
      action: async () => {
        try {
          await deleteConversation(conversation)
        } catch (err) {
          showToast({ tone: 'error', message: getErrorMessage(err, 'Could not delete conversation.') })
          throw err
        }
      },
    })
  }

  return (
    <>
      <PageContainer>
        <MessagesHero />

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="All conversations"
            value={counts.all}
            text="Every message thread"
            icon={<ChatBubbleLeftRightIcon className="h-5 w-5" />}
          />

          <StatCard
            label="Booking chats"
            value={counts.booking}
            text="Linked to bookings"
            icon={<CalendarDaysIcon className="h-5 w-5" />}
          />

          <StatCard
            label="Direct inquiries"
            value={counts.direct}
            text="General questions"
            icon={<EnvelopeIcon className="h-5 w-5" />}
          />

          <StatCard
            label="Unread threads"
            value={counts.unread}
            text="Need your attention"
            icon={<ClockIcon className="h-5 w-5" />}
          />
        </section>

        <MessagesFilters
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          filterTabs={filterTabs}
        />

        <section className="mt-6">
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

      <ConfirmModal {...modalProps} />
    </>
  )
}
