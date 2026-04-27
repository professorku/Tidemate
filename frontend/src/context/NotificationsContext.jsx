import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../features/notifications/services/notificationService'
import { useNotificationsSocket } from '../features/notifications/hooks/useNotificationsSocket'
import { createEmptyNotificationsPage, PREVIEW_PAGE_SIZE } from '../features/notifications/utils/notificationPage'
import { normalizeNotifications, upsertNotificationItem } from './notifications/stateHelpers'

const NotificationsContext = createContext(null)

export default NotificationsContext

export function NotificationsProvider({ children }) {
  const { isAuthenticated, isAuthReady, expireSession } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])

  const replaceNotifications = useCallback((items) => {
    setNotifications(normalizeNotifications(items))
  }, [])

  const handleSocketAuthFailure = useCallback((detail) => {
    replaceNotifications([])
    expireSession()
    showToast({
      tone: 'info',
      message: detail || 'Your session expired. Please sign in again.',
    })
  }, [expireSession, replaceNotifications, showToast])

  const upsertNotification = useCallback((notification) => {
    setNotifications((prev) => upsertNotificationItem(prev, notification))
  }, [])

  const fetchNotificationPage = useCallback(async ({ page = 1, pageSize = 12, syncStore = false } = {}) => {
    const pageData = await listNotifications({ page, page_size: pageSize })

    if (syncStore || page === 1) {
      replaceNotifications(pageData.results)
    }

    return pageData
  }, [replaceNotifications])

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      replaceNotifications([])
      return createEmptyNotificationsPage()
    }

    return fetchNotificationPage({ page: 1, pageSize: PREVIEW_PAGE_SIZE, syncStore: true })
  }, [fetchNotificationPage, isAuthenticated, replaceNotifications])

  const socketApi = useNotificationsSocket({
    isEnabled: isAuthenticated,
    onNotification: upsertNotification,
    onAuthFailure: handleSocketAuthFailure,
  })

  useEffect(() => {
    if (!isAuthReady) {
      return undefined
    }

    if (!isAuthenticated) {
      replaceNotifications([])
      socketApi.disconnect()
      return undefined
    }

    void refreshNotifications()
    socketApi.connect()

    return () => {
      socketApi.disconnect()
    }
  }, [isAuthenticated, isAuthReady, refreshNotifications, replaceNotifications, socketApi])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const syncOnFocus = () => {
      if (isAuthenticated && isAuthReady) {
        void refreshNotifications()
      }
    }

    const handleOnline = () => syncOnFocus()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncOnFocus()
      }
    }

    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, isAuthReady, refreshNotifications])

  const markAsRead = useCallback(async (notificationId) => {
    await markNotificationRead(notificationId)
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, is_read: true } : item
      )
    )
  }, [])

  const markAllAsRead = useCallback(async () => {
    const hasUnreadNotifications = notifications.some((item) => !item.is_read)
    if (!hasUnreadNotifications) {
      return
    }

    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
  }, [notifications])

  const visibleNotifications = useMemo(
    () => (isAuthenticated ? notifications : []),
    [isAuthenticated, notifications]
  )

  const unreadCount = useMemo(
    () => visibleNotifications.filter((notification) => !notification.is_read).length,
    [visibleNotifications]
  )

  const value = useMemo(
    () => ({
      notifications: visibleNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      fetchNotificationPage,
      replaceNotifications,
      upsertNotification,
    }),
    [
      visibleNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      fetchNotificationPage,
      replaceNotifications,
      upsertNotification,
    ]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}
