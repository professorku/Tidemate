import { BellAlertIcon } from '@heroicons/react/24/outline'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import LoadingState from '../../../components/ui/LoadingState'
import PaginationControls from '../../../components/ui/PaginationControls'
import { useNotifications } from '../../../context/useNotifications'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { markAsRead, markAllAsRead, fetchNotificationPage } = useNotifications()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)
  const [pagination, setPagination] = useState({ count: 0, page: 1, totalPages: 1 })

  const loadNotifications = async (page = 1) => {
    setLoading(true)
    setError('')

    try {
      const pageData = await fetchNotificationPage({ page, pageSize: 12 })
      setNotifications(pageData.results)
      setPagination({ count: pageData.count, page: pageData.page, totalPages: pageData.totalPages })
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
  }

  useEffect(() => {
    void loadNotifications()
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  )

  const openNotification = async (notification) => {
    try {
      if (!notification.is_read) {
        await markAsRead(notification.id)
        setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item)))
      }

      navigate(notification.target_url || '/notifications')
    } catch (err) {
      console.error('Failed to open notification:', err)
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not open notification.') })
    }
  }

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return

    try {
      setMarkingAll(true)
      await markAllAsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })))
      showToast({ tone: 'success', message: 'All notifications marked as read.' })
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not update notifications.') })
    } finally {
      setMarkingAll(false)
    }
  }

  const setPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return
    void loadNotifications(page)
  }

  return (
    <PageContainer size="compact" className="py-6 md:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Notifications</h1>
          <p className="mt-2 text-slate-600">
            Booking updates, new messages, and account activity will appear here.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={loading || markingAll || unreadCount === 0}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markingAll ? 'Updating...' : 'Mark all as read'}
        </button>
      </div>

      {loading ? (
        <StatePanel
          icon={<BellAlertIcon className="h-8 w-8" />}
          title="Loading notifications"
          text="We are fetching your latest booking updates and messages."
          tone="subtle"
          compact
        />
      ) : null}

      {!loading && error ? (
        <StatePanel
          icon={<ExclamationTriangleIcon className="h-8 w-8" />}
          title="Could not load notifications"
          text={error}
          actionLabel="Try again"
          onAction={() => loadNotifications(pagination.page || 1)}
          tone="error"
          compact
        />
      ) : null}

      {!loading && !error && notifications.length === 0 ? (
        <EmptyState
          icon={<BellAlertIcon className="h-8 w-8" />}
          title="No notifications yet"
          text="Booking updates and marketplace activity will appear here as soon as something happens."
          actionLabel="Browse boats"
          actionTo="/"
          compact={false}
        />
      ) : null}

      {!loading && !error && notifications.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
              : 'Everything is up to date'}
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                className={`block w-full rounded-[24px] border p-6 text-left shadow-soft transition hover:-translate-y-0.5 ${
                  notification.is_read
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-200 bg-mist'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-slate-800">{notification.message}</p>
                  {!notification.is_read ? (
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                      New
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Just now'}
                </p>
              </button>
            ))}
          </div>

          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            count={pagination.count}
            itemLabel="notifications"
            onPrevious={() => setPage(pagination.page - 1)}
            onNext={() => setPage(pagination.page + 1)}
          />
        </>
      ) : null}
    </PageContainer>
  )
}
