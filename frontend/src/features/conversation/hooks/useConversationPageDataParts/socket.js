import { useMemo } from 'react'
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
  const { isAuthenticated, isAuthReady } = useAuth()

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
    getMessageAuthFailure: getSessionRevokedAuthFailure,
    getCloseAuthFailure,
  })

  return useMemo(
    () => ({
      isConnected: socketApi.isConnected,
      sendMessage: (text) => socketApi.sendJson({ type: 'message.send', text }),
      deleteMessage: (messageId) => socketApi.sendJson({ type: 'message.delete', message_id: messageId }),
      markRead: () => socketApi.sendJson({ type: 'message.read' }),
      reconnect: socketApi.connect,
    }),
    [socketApi]
  )
}
