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
import StatePanel from '../../../components/ui/StatePanel'
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
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
          : 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
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
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
          <PageContainer size="content" className="py-8 md:py-10">
            <StatePanel
              icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
              title="Loading conversation"
              text="We are fetching the messages and booking details for this thread."
              tone="subtle"
              compact
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
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
          <PageContainer size="content" className="py-8 md:py-10">
            <StatePanel
              icon={<ExclamationTriangleIcon className="h-8 w-8" />}
              title="Conversation not found"
              text="The conversation could not be loaded. It may have been deleted or you may not have access anymore."
              actionLabel="Back to messages"
              actionTo="/messages"
              tone="error"
              compact
            />
          </PageContainer>
        </main>

        <ConfirmModal {...modalProps} />
      </>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <PageContainer
          size="wide"
          as="div"
          className="py-8 md:py-10"
          contentClassName="space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to messages
            </Link>

            <ChatConnectionBadge connected={chatConnected} />
          </div>

          <section className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
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

                <h1 className="mt-3 truncate text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                  {conversation.boat_title || 'Direct conversation'}
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Chatting with{' '}
                  <span className="font-bold text-slate-900">
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
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
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