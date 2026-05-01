import {
  ChatBubbleLeftRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import EmptyConversation from './EmptyConversation'
import MessageBubble from './MessageBubble'
import { dayLabel, shouldShowDateSeparator } from '../utils/conversationFormatters'

export default function ConversationThread({
  error,
  messagesPagination,
  onLoadOlderMessages,
  loadingOlderMessages,
  quickPrompts,
  onQuickPrompt,
  messages,
  sending,
  deletingMessageId,
  messagesEndRef,
  roleInfo,
  isMyMessage,
  getAvatarForMessage,
  onDeleteMessage,
  canDeleteConversation,
  onDeleteConversation,
  deletingConversation,
}) {
  return (
    <div className="text-white">
      {error ? (
        <div className="border-b border-red-400/40 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-100 md:px-6">
          {error}
        </div>
      ) : null}

      <div className="border-b border-white/15 bg-navy px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-gold" />

              <p className="text-sm font-extrabold text-white">
                Conversation thread
              </p>
            </div>

            <p className="mt-1 text-sm text-white/55">
              Messages are shown in time order.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={`${prompt}-${index}`}
                type="button"
                onClick={() => onQuickPrompt(prompt)}
                className="rounded-full border border-white/25 bg-[#071d32] px-3 py-2 text-xs font-semibold text-white transition hover:bg-ocean"
              >
                {index === 0
                  ? 'Pickup time'
                  : index === 1
                    ? 'Included?'
                    : 'Trip question'}
              </button>
            ))}

            {canDeleteConversation ? (
              <button
                type="button"
                onClick={onDeleteConversation}
                disabled={deletingConversation}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
                {deletingConversation ? 'Deleting...' : 'Delete thread'}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="h-[62vh] min-h-[500px] overflow-y-auto bg-[#071d32] px-4 py-5 md:px-6 md:py-6">
        {messagesPagination?.hasOlder ? (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={onLoadOlderMessages}
              disabled={loadingOlderMessages}
              className="rounded-full border border-white/25 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingOlderMessages ? 'Loading older messages...' : 'Load older messages'}
            </button>
          </div>
        ) : null}

        {messages.length === 0 ? (
          <EmptyConversation otherUsername={roleInfo.otherUsername} />
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const mine = isMyMessage(message)
              const sender = getAvatarForMessage(message)
              const previousMessage = index > 0 ? messages[index - 1] : null
              const showDate = shouldShowDateSeparator(message, previousMessage)
              const showAvatar =
                !previousMessage ||
                previousMessage.sender_username !== message.sender_username ||
                shouldShowDateSeparator(message, previousMessage)

              return (
                <div key={message.id}>
                  {showDate ? (
                    <div className="my-6 flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/15" />

                      <span className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-navy shadow-sm ring-1 ring-gold/40">
                        {dayLabel(message.created_at)}
                      </span>

                      <div className="h-px flex-1 bg-white/15" />
                    </div>
                  ) : null}

                  <MessageBubble
                    message={message}
                    mine={mine}
                    sender={sender}
                    showAvatar={!mine && showAvatar}
                    onDelete={onDeleteMessage}
                    deletingMessageId={deletingMessageId}
                  />
                </div>
              )
            })}

            {sending ? (
              <div className="flex justify-end">
                <div className="rounded-[26px] rounded-br-md bg-gold px-5 py-3 text-sm font-semibold text-navy shadow-sm opacity-80">
                  Sending...
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}