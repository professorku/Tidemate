import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/react/24/outline'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import { deleteConversation } from '../../../api/domains/chat'
import { useToast } from '../../../context/useToast'
import useAppSync from '../../../hooks/useAppSync'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { getErrorMessage } from '../../../utils/errors'
import ConversationSidebar from '../../conversation/components/ConversationSidebar'
import ConversationThread from '../../conversation/components/ConversationThread'
import MessageComposer from '../../conversation/components/MessageComposer'
import useConversationPageData from '../../conversation/hooks/useConversationPageData'
import {
  getConversationTypeLabel,
  getTripStateClass,
  getTripStateLabel,
} from '../../conversation/utils/conversationFormatters'

function ChatConnectionBadge({ connected }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
        connected
          ? 'bg-gold text-navy ring-1 ring-gold/40'
          : 'bg-gold/15 text-gold ring-1 ring-gold/40'
      }`}
    >
      {connected ? (
        <SignalIcon className="h-4 w-4" />
      ) : (
        <SignalSlashIcon className="h-4 w-4" />
      )}
      {connected ? 'Realtime connected' : 'Reconnecting...'}
    </span>
  )
}

function ConversationStatePanel({ icon, title, text, actionLabel, actionTo }) {
  return (
    <div className="rounded-[30px] border border-white/15 bg-navy px-6 py-10 text-center text-white shadow-soft">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
        {icon}
      </div>

      <h1 className="mt-5 text-2xl font-black tracking-tight text-white">
        {title}
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
        {text}
      </p>

      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}

export default function ConversationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { openConfirm, modalProps } = useConfirmAction()
  const { showToast } = useToast()
  const { syncChatState } = useAppSync()

  const {
    conversation,
    messages,
    text,
    setText,
    loading,
    sending,
    loadingOlderMessages,
    deletingMessageId,
    deletingConversation,
    setDeletingConversation,
    error,
    roleInfo,
    quickPrompts,
    tripState,
    messagesEndRef,
    textareaRef,
    isMyMessage,
    getAvatarForMessage,
    sendMessage,
    deleteMessage,
    canDeleteConversation,
    handleQuickPrompt,
    handleKeyDown,
    messagesPagination,
    loadOlderMessages,
    chatConnected,
    reload,
  } = useConversationPageData(id)

  const requestDeleteConversation = async () => {
    if (!conversation) return

    openConfirm({
      title: 'Delete conversation?',
      message: 'This removes the conversation from the database for the participants.',
      confirmLabel: 'Delete conversation',
      tone: 'danger',
      action: async () => {
        setDeletingConversation(true)

        try {
          await deleteConversation(conversation.id)
          await syncChatState()
          navigate('/messages')
        } catch (err) {
          console.error(err)
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Could not delete conversation.'),
          })
          throw err
        } finally {
          setDeletingConversation(false)
        }
      },
    })
  }

  const requestDeleteMessage = (message) => {
    openConfirm({
      title: 'Delete message?',
      message: 'Your message will stay in the conversation as a deleted placeholder.',
      confirmLabel: 'Delete message',
      tone: 'danger',
      action: async () => {
        try {
          await deleteMessage(message)
        } catch (err) {
          console.error(err)
          showToast({
            tone: 'error',
            message: getErrorMessage(err, 'Could not delete message.'),
          })
          throw err
        }
      },
    })
  }

  if (loading) {
    return (
      <>
        <main className="min-h-screen bg-[#071d32]">
          <PageContainer size="content" className="py-8 md:py-10">
            <ConversationStatePanel
              icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
              title="Loading conversation"
              text="We are fetching the messages and booking details for this thread."
            />
          </PageContainer>
        </main>

        <ConfirmModal {...modalProps} />
      </>
    )
  }

  if (!conversation) {
    return (
      <>
        <main className="min-h-screen bg-[#071d32]">
          <PageContainer size="content" className="py-8 md:py-10">
            <ConversationStatePanel
              icon={<ExclamationTriangleIcon className="h-8 w-8" />}
              title="Conversation not found"
              text="The conversation could not be loaded. It may have been deleted or you may not have access anymore."
              actionLabel="Back to messages"
              actionTo="/messages"
            />
          </PageContainer>
        </main>

        <ConfirmModal {...modalProps} />
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer
          size="wide"
          as="div"
          className="py-8 md:py-10"
          contentClassName="space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-ocean"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to messages
            </Link>

            <ChatConnectionBadge connected={chatConnected} />
          </div>

          <section className="rounded-[34px] border border-white/15 bg-navy p-5 text-white shadow-soft md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-navy ring-1 ring-gold/40">
                    {getConversationTypeLabel(conversation)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getTripStateClass(
                      conversation
                    )}`}
                  >
                    {getTripStateLabel(conversation)}
                  </span>
                </div>

                <h1 className="mt-3 truncate text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                  {conversation.boat_title || 'Direct conversation'}
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  Chatting with{' '}
                  <span className="font-bold text-gold">
                    {roleInfo.otherUsername || 'the other person'}
                  </span>
                  {conversation.booking_id
                    ? ` · Booking #${conversation.booking_id}`
                    : ' · Direct inquiry'}
                </p>
              </div>

              <button
                type="button"
                onClick={reload}
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
              >
                Refresh
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="overflow-hidden rounded-[30px] border border-white/15 bg-navy shadow-soft">
              <ConversationThread
                error={error}
                quickPrompts={quickPrompts}
                messagesPagination={messagesPagination}
                onLoadOlderMessages={loadOlderMessages}
                loadingOlderMessages={loadingOlderMessages}
                onQuickPrompt={handleQuickPrompt}
                messages={messages}
                sending={sending}
                deletingMessageId={deletingMessageId}
                messagesEndRef={messagesEndRef}
                roleInfo={roleInfo}
                isMyMessage={isMyMessage}
                getAvatarForMessage={getAvatarForMessage}
                onDeleteMessage={requestDeleteMessage}
                canDeleteConversation={canDeleteConversation}
                onDeleteConversation={requestDeleteConversation}
                deletingConversation={deletingConversation}
              />

              <MessageComposer
                text={text}
                setText={setText}
                sending={sending}
                onSubmit={sendMessage}
                onKeyDown={handleKeyDown}
                textareaRef={textareaRef}
              />
            </div>

            <ConversationSidebar
              conversation={conversation}
              messages={messages}
              tripState={tripState}
            />
          </section>
        </PageContainer>
      </main>

      <ConfirmModal {...modalProps} />
    </>
  )
}