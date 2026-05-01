import useLongPressReveal from '../../../utils/useLongPressReveal'
import ConversationCardActions from './conversationCard/ConversationCardActions'
import ConversationCardMedia from './conversationCard/ConversationCardMedia'
import ConversationCardMetaGrid from './conversationCard/ConversationCardMetaGrid'
import ConversationCardSummary from './conversationCard/ConversationCardSummary'
import {
  getConversationLastMessage,
  getOtherUser,
} from './conversationCard/conversationCard.utils'

export default function ConversationCard({
  conversation,
  currentUsername,
  onDelete,
  deletingConversationId,
  canDelete,
}) {
  const { revealed, toggle, hide, bind } = useLongPressReveal()
  const isDeleting = deletingConversationId === conversation.id
  const unreadCount = Number(conversation.unread_count || 0)
  const lastMessage = getConversationLastMessage(conversation)
  const { isHost, otherUser } = getOtherUser(conversation, currentUsername)

  return (
    <article
      {...bind}
      className={`group overflow-hidden rounded-[30px] border bg-[#071d32] text-white shadow-soft transition hover:-translate-y-0.5 ${
        unreadCount > 0
          ? 'border-gold/60 ring-1 ring-gold/30'
          : 'border-white/15'
      }`}
    >
      <div className="flex flex-col lg:flex-row">
        <ConversationCardMedia
          conversation={conversation}
          unreadCount={unreadCount}
          canDelete={canDelete}
          revealed={revealed}
          isDeleting={isDeleting}
          onDelete={onDelete}
          toggle={toggle}
          hide={hide}
        />

        <div className="flex min-w-0 flex-1 flex-col p-5 md:p-6">
          <ConversationCardSummary
            conversation={conversation}
            otherUser={otherUser}
            canDelete={canDelete}
            lastMessage={lastMessage}
            unreadCount={unreadCount}
          />

          <ConversationCardMetaGrid conversation={conversation} isHost={isHost} />

          <ConversationCardActions conversation={conversation} />
        </div>
      </div>
    </article>
  )
}