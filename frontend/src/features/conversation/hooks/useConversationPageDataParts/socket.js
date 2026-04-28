import { useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../../../../context/useAuth'
import { useManagedWebSocket } from '../../../../hooks/useManagedWebSocket'
import {
  buildWebSocketUrl,
  getCloseAuthFailure,
  getSessionRevokedAuthFailure,
} from '../../../../lib/websocket'

export function useConversationSocket({
  conversationId,
  isEnabled,
  onMessageCreated,
  onMessageDeleted,
  onMessagesRead,
  onConversationSnapshot,
  onSocketError,
  onAuthFailure,
}) {
  const { isAuthenticated, isAuthReady, refreshUser } = useAuth()

  const refreshSocketSession = useCallback(async () => {
    const currentUser = await refreshUser()
    return Boolean(currentUser)
  }, [refreshUser])

  const socketApi = useManagedWebSocket({
    url: conversationId
      ? buildWebSocketUrl(`/ws/chat/conversations/${conversationId}/`)
      : null,
    isEnabled: Boolean(isEnabled && conversationId),
    isAuthReady,
    isAuthenticated,
    baseReconnectDelayMs: 1500,
    maxReconnectDelayMs: 10000,
    maxReconnectAttempts: 8,
    onOpen: () => {
      socketApi.sendJson({ type: 'message.read' })
    },
    onMessage: (data) => {
      switch (data.type) {
        case 'message.created':
          onMessageCreated?.(data)
          return
        case 'message.deleted':
          onMessageDeleted?.(data)
          return
        case 'message.read':
          onMessagesRead?.(data)
          return
        case 'conversation.snapshot':
          onConversationSnapshot?.(data.conversation)
          return
        case 'chat.error':
          onSocketError?.(data.detail || 'Chat connection error.')
          return
        default:
          return
      }
    },
    onError: (_error, meta) => {
      if (meta?.type === 'socket_error') {
        onSocketError?.('Realtime chat connection was interrupted.')
        return
      }

      if (meta?.type === 'invalid_payload') {
        onSocketError?.('Invalid realtime chat payload.')
      }
    },
    onAuthFailure,
    onAuthRefresh: refreshSocketSession,
    getMessageAuthFailure: getSessionRevokedAuthFailure,
    getCloseAuthFailure,
  })

  const {
    connect,
    disconnect,
    isConnected,
    sendJson,
  } = socketApi

  useEffect(() => {
    if (!conversationId || !isEnabled || !isAuthReady || !isAuthenticated) {
      disconnect()
      return undefined
    }

    connect()

    return () => {
      disconnect()
    }
  }, [
    connect,
    conversationId,
    disconnect,
    isAuthenticated,
    isAuthReady,
    isEnabled,
  ])

  return useMemo(
    () => ({
      isConnected,
      sendMessage: (text) => sendJson({ type: 'message.send', text }),
      deleteMessage: (messageId) => sendJson({ type: 'message.delete', message_id: messageId }),
      markRead: () => sendJson({ type: 'message.read' }),
      reconnect: connect,
    }),
    [connect, isConnected, sendJson]
  )
}