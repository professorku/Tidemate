import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import ConversationCard from './ConversationCard'

export default function MessagesResults({
  loading,
  error,
  search,
  filter,
  conversations,
  currentUsername,
  onRetry,
  onDeleteConversation,
  deletingConversationId,
  canDeleteConversation,
}) {
  if (loading) {
    return (
      <LoadingState
        icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
        title="Loading conversations"
        text="We are fetching your latest booking chats and direct messages."
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load conversations"
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (conversations.length === 0) {
    return search || filter !== 'all' ? (
      <EmptyState
        icon={<MagnifyingGlassIcon className="h-8 w-8" />}
        title="No conversations match"
        text="Try a different search term or switch back to all conversations."
        tone="subtle"
      />
    ) : (
      <EmptyState
        icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
        title="No conversations yet"
        text="When you contact a host or receive a booking-related message, your conversations will appear here."
        actionLabel="Browse boats"
        actionTo="/"
      />
    )
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          currentUsername={currentUsername}
          onDelete={onDeleteConversation}
          deletingConversationId={deletingConversationId}
          canDelete={canDeleteConversation(conversation)}
        />
      ))}
    </div>
  )
}