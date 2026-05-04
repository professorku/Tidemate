import {
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import ConversationCard from './ConversationCard'
import { ConversationCardSkeletonList } from '../../../components/ui/Skeleton'

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
    return <ConversationCardSkeletonList count={4} />
  }

  if (error) {
    return (
      <PanelState
        icon={<ExclamationTriangleIcon className="h-8 w-8" />}
        title="Could not load conversations"
        text={error}
      >
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          Try again
        </button>
      </PanelState>
    )
  }

  if (conversations.length === 0) {
    return search || filter !== 'all' ? (
      <PanelState
        icon={<MagnifyingGlassIcon className="h-8 w-8" />}
        title="No conversations match"
        text="Try a different search term or switch back to all conversations."
      />
    ) : (
      <PanelState
        icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
        title="No conversations yet"
        text="When you contact a host or receive a booking-related message, your conversations will appear here."
      >
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          Browse boats
        </Link>
      </PanelState>
    )
  }

  return (
    <div className="space-y-5">
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