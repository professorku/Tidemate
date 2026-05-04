import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import ErrorState from '../../../components/ui/ErrorState'
import { useNotifications } from '../../../context/useNotifications'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'
import { safeInternalPath } from '../../../utils/navigation'
import EmptyNotificationsState from '../components/EmptyNotificationsState'
import NotificationList from '../components/NotificationList'
import NotificationsHero from '../components/NotificationsHero'
import NotificationsLoadingSkeleton from '../components/NotificationsLoadingSkeleton'
import NotificationsSummaryGrid from '../components/NotificationsSummaryGrid'
import NotificationsToolbar from '../components/NotificationsToolbar'
import { formatNotificationTime } from '../utils/notificationPage'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const {
    unreadCount: globalUnreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotificationPage,
  } = useNotifications()
  const { showToast } = useToast()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)
  const [pagination, setPagination] = useState({
    count: 0,
    page: 1,
    totalPages: 1,
  })

  const loadNotifications = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')

      try {
        const pageData = await fetchNotificationPage({ page, pageSize: 12 })

        setNotifications(Array.isArray(pageData.results) ? pageData.results : [])
        setPagination({
          count: pageData.count ?? 0,
          page: pageData.page ?? page,
          totalPages: pageData.totalPages ?? 1,
        })
      } catch (err) {
        console.error('Failed to load notifications:', err)

        const message = getErrorMessage(err, 'Could not load notifications.')
        setError(message)
        showToast({ tone: 'error', message })
        setNotifications([])
        setPagination({ count: 0, page: 1, totalPages: 1 })
      } finally {
        setLoading(false)
      }
    },
    [fetchNotificationPage, showToast]
  )

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  const pageUnreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  )

  const visibleUnreadCount = Math.max(globalUnreadCount, pageUnreadCount)

  const latestNotificationTime = notifications[0]?.created_at
    ? formatNotificationTime(notifications[0].created_at)
    : 'No activity yet'

  const openNotification = async (notification) => {
    try {
      if (!notification.is_read) {
        await markAsRead(notification.id)

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        )
      }

      navigate(safeInternalPath(notification.target_url))
    } catch (err) {
      console.error('Failed to open notification:', err)

      showToast({
        tone: 'error',
        message: getErrorMessage(err, 'Could not open notification.'),
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (globalUnreadCount === 0 && pageUnreadCount === 0) return

    try {
      setMarkingAll(true)
      await markAllAsRead()

      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))

      showToast({
        tone: 'success',
        message: 'All notifications marked as read.',
      })
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)

      showToast({
        tone: 'error',
        message: getErrorMessage(err, 'Could not update notifications.'),
      })
    } finally {
      setMarkingAll(false)
    }
  }

  const setPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return
    void loadNotifications(page)
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer
        size="page"
        className="py-8 md:py-10"
        as="div"
        contentClassName="space-y-6"
      >
        <NotificationsHero />

        <NotificationsSummaryGrid
          totalCount={pagination.count}
          unreadCount={visibleUnreadCount}
          pageUnreadCount={pageUnreadCount}
          latestNotificationTime={latestNotificationTime}
        />

        <section className="rounded-[32px] border border-gold/20 bg-navy p-4 shadow-soft md:p-6">
          <NotificationsToolbar
            pageUnreadCount={pageUnreadCount}
            globalUnreadCount={globalUnreadCount}
            loading={loading}
            markingAll={markingAll}
            onRefresh={() => loadNotifications(pagination.page || 1)}
            onMarkAllAsRead={handleMarkAllAsRead}
          />

          {loading ? <NotificationsLoadingSkeleton /> : null}

          {!loading && error ? (
            <ErrorState
              title="Could not load notifications"
              message={error}
              actionLabel="Try again"
              onRetry={() => loadNotifications(pagination.page || 1)}
              compact
            />
          ) : null}

          {!loading && !error && notifications.length === 0 ? (
            <EmptyNotificationsState />
          ) : null}

          {!loading && !error && notifications.length > 0 ? (
            <NotificationList
              notifications={notifications}
              pagination={pagination}
              loading={loading}
              onOpenNotification={openNotification}
              onPageChange={setPage}
            />
          ) : null}
        </section>
      </PageContainer>
    </main>
  )
}