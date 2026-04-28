import { useCallback } from 'react'
import { useManagedWebSocket } from '../../../hooks/useManagedWebSocket'
import {
  buildWebSocketUrl,
  getCloseAuthFailure,
  getSessionRevokedAuthFailure,
} from '../../../lib/websocket'
import { useAuth } from '../../../context/useAuth'

function logSocketEvent(...args) {
  if (import.meta.env.DEV) {
    console.log(...args)
  }
}

export function useNotificationsSocket({
  isEnabled = true,
  onNotification,
  onSocketError,
  onAuthFailure,
}) {
  const { isAuthenticated, isAuthReady, refreshUser } = useAuth()

  const refreshSocketSession = useCallback(async () => {
    const currentUser = await refreshUser()
    return Boolean(currentUser)
  }, [refreshUser])

  return useManagedWebSocket({
    url: isAuthenticated ? buildWebSocketUrl('/ws/notifications/') : null,
    isEnabled,
    isAuthReady,
    isAuthenticated,
    onOpen: () => {
      logSocketEvent('Notifications websocket connected')
    },
    onMessage: (data) => {
      if (data.type === 'notification' && data.notification) {
        onNotification?.(data.notification)
      }
    },
    onClose: (event) => {
      logSocketEvent('Notifications websocket disconnected', event.code)
    },
    onError: (error, meta) => {
      if (meta?.type === 'socket_error') {
        onSocketError?.('Realtime notifications connection was interrupted.')
      }

      if (import.meta.env.DEV) {
        console.error('Notifications websocket error:', meta?.type || 'unknown', error)
      }
    },
    onAuthFailure,
    onAuthRefresh: refreshSocketSession,
    getMessageAuthFailure: getSessionRevokedAuthFailure,
    getCloseAuthFailure,
  })
}