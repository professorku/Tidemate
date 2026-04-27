import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import useAppSync from '../../../hooks/useAppSync'
import { createInitialMessagesPagination } from './useConversationPageDataParts/pagination'
import { useConversationDataFetching } from './useConversationPageDataParts/dataFetching'
import { useConversationDerivedState } from './useConversationPageDataParts/derivedState'
import { useConversationMessageActions } from './useConversationPageDataParts/messageActions'
import { useConversationSocket } from './useConversationPageDataParts/socket'
import { applyDeletedConversationMessage, upsertConversationMessage } from './useConversationPageDataParts/socketState'

export default function useConversationPageData(id) {
  const { user: me, expireSession } = useAuth()
  const { syncChatState } = useAppSync()

  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState(null)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [error, setError] = useState('')
  const [messagesPagination, setMessagesPagination] = useState(createInitialMessagesPagination)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const handleSocketMessageCreated = useCallback((event) => {
    if (!event?.message) return

    setMessages((prev) => upsertConversationMessage(prev, event.message))
    setError('')
    void syncChatState()
  }, [syncChatState])

  const handleSocketMessageDeleted = useCallback((event) => {
    if (!event?.message) return

    setMessages((prev) => applyDeletedConversationMessage(prev, event.message))
    setDeletingMessageId((current) => (current === event.message.id ? null : current))
    setError('')
    void syncChatState()
  }, [syncChatState])

  const handleSocketMessagesRead = useCallback((event) => {
    if (!event?.actor_id || event.actor_id === me?.id) return

    setMessages((prev) => prev.map((message) =>
      message.sender === me?.id ? { ...message, is_read: true } : message
    ))
    void syncChatState()
  }, [me?.id, syncChatState])

  const handleConversationSnapshot = useCallback((nextConversation) => {
    if (!nextConversation) return
    setConversation(nextConversation)
  }, [])

  const handleSocketError = useCallback((message) => {
    setError(message || 'Realtime chat connection error.')
  }, [])

  const handleSocketAuthFailure = useCallback((message) => {
    expireSession()
    setError(message || 'Your session expired. Please sign in again.')
  }, [expireSession])

  const socketApi = useConversationSocket({
    conversationId: id,
    isEnabled: Boolean(id),
    onMessageCreated: handleSocketMessageCreated,
    onMessageDeleted: handleSocketMessageDeleted,
    onMessagesRead: handleSocketMessagesRead,
    onConversationSnapshot: handleConversationSnapshot,
    onSocketError: handleSocketError,
    onAuthFailure: handleSocketAuthFailure,
  })

  const { loadMessages, loadPage } = useConversationDataFetching({
    id,
    setConversation,
    setMessages,
    setMessagesPagination,
    setLoading,
    setLoadingOlderMessages,
    setError,
  })

  const { sendMessage, deleteMessage, handleKeyDown, handleQuickPrompt } =
    useConversationMessageActions({
      id,
      text,
      sending,
      loadMessages,
      socketApi,
      setText,
      setError,
      setSending,
      textareaRef,
      setMessages,
      setDeletingMessageId,
      syncChatState,
    })

  const {
    roleInfo,
    isMyMessage,
    getAvatarForMessage,
    quickPrompts,
    canDeleteConversation,
    tripState,
  } = useConversationDerivedState({ conversation, me })

  useEffect(() => {
    loadPage()
  }, [loadPage])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (messages.some((message) => message.sender !== me?.id && !message.is_read)) {
      socketApi.markRead()
    }
  }, [me?.id, messages, socketApi])

  const loadOlderMessages = async () => {
    if (loadingOlderMessages || !messagesPagination.nextCursor) {
      return
    }

    try {
      await loadMessages({
        cursor: messagesPagination.nextCursor,
        append: true,
        silent: true,
      })
    } catch (err) {
      console.error(err)
      setError('Could not load older messages.')
    }
  }

  return {
    conversation,
    messages,
    me,
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
    reload: loadPage,
    messagesPagination,
    loadOlderMessages,
    chatConnected: socketApi.isConnected,
  }
}
