import { ChatBubbleLeftRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import ConfirmModal from '../../../components/ui/ConfirmModal'
import StatePanel from '../../../components/ui/StatePanel'  
import ConversationSidebar from '../../conversation/components/ConversationSidebar'
import ConversationThread from '../../conversation/components/ConversationThread'
import MessageComposer from '../../conversation/components/MessageComposer'
import useConversationPageData from '../../conversation/hooks/useConversationPageData'
import useConfirmAction from '../../../hooks/useConfirmAction'
import { useToast } from '../../../context/useToast'
import { deleteConversation } from '../../../api/domains/chat'
import { getErrorMessage } from '../../../utils/errors'
import useAppSync from '../../../hooks/useAppSync'

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
          showToast({ tone: 'error', message: getErrorMessage(err, 'Could not delete conversation.') })
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
          showToast({ tone: 'error', message: getErrorMessage(err, 'Could not delete message.') })
          throw err
        }
      },
    })
  }

  if (loading) {
    return (
      <>
        <PageContainer className="py-6 md:py-8">
          <StatePanel
            icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
            title="Loading conversation"
            text="We are fetching the messages and booking details for this thread."
            tone="subtle"
            compact
          />
        </PageContainer>
        <ConfirmModal {...modalProps} />
      </>
    )
  }

  if (!conversation) {
    return (
      <>
        <PageContainer className="py-6 md:py-8">
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
        <ConfirmModal {...modalProps} />
      </>
    )
  }

return (
  <>
    <PageContainer>
      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500 md:px-6">
            Realtime chat: {chatConnected ? 'Connected' : 'Reconnecting…'}
          </div>

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

    <ConfirmModal {...modalProps} />
  </>
)
}
