import {
  BellAlertIcon,
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorState from '../../../components/ui/ErrorState'
import PaginationControls from '../../../components/ui/PaginationControls'
import { useNotifications } from '../../../context/useNotifications'
import { useToast } from '../../../context/useToast'
import { getErrorMessage } from '../../../utils/errors'
import {
  formatNotificationFullTime,
  formatNotificationTime,
  getNotificationKind,
  getNotificationKindLabel,
} from '../utils/notificationPage'

const NOTIFICATION_ICONS = {
  message: ChatBubbleLeftRightIcon,
  booking: CalendarDaysIcon,
  review: StarIcon,
  account: ShieldCheckIcon,
  update: BellIcon,
}

const NOTIFICATION_ICON_CLASSES = {
  message: 'bg-sky-50 text-sky-700 ring-sky-100',
  booking: 'bg-amber-50 text-amber-700 ring-amber-100',
  review: 'bg-violet-50 text-violet-700 ring-violet-100',
  account: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  update: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function NotificationIcon({ notification }) {
  const kind = getNotificationKind(notification)
  const Icon = NOTIFICATION_ICONS[kind] || BellIcon

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${
        NOTIFICATION_ICON_CLASSES[kind] || NOTIFICATION_ICON_CLASSES.update
      }`}
    >
      <Icon className="h-6 w-6" />
    </div>
  )
}

function SummaryCard({ icon, label, value, text }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-navy">
          {icon}
        </div>
      </div>

      {text ? <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p> : null}
    </div>
  )
}

function NotificationCard({ notification, onOpen }) {
  const kindLabel = getNotificationKindLabel(notification)

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className={`group block w-full rounded-[28px] border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft md:p-6 ${
        notification.is_read
          ? 'border-slate-200 bg-white'
          : 'border-gold/40 bg-gradient-to-br from-amber-50 via-white to-white ring-1 ring-gold/20'
      }`}
    >
      <div className="flex gap-4">
        <NotificationIcon notification={notification} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              {kindLabel}
            </span>

            {!notification.is_read ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-xs font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                New
              </span>
            ) : null}
          </div>

          <p
            className={`mt-3 text-base leading-7 ${
              notification.is_read ? 'text-slate-700' : 'font-semibold text-slate-950'
            }`}
          >
            {notification.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span
              className="text-slate-500"
              title={formatNotificationFullTime(notification.created_at)}
            >
              {formatNotificationTime(notification.created_at)}
            </span>

            <span className="font-semibold text-navy transition group-hover:text-gold">
              Open update
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-5 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

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

      navigate(notification.target_url || '/notifications')
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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
      <PageContainer
        size="page"
        className="py-8 md:py-10"
        as="div"
        contentClassName="space-y-6"
      >
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
          <div className="relative bg-gradient-to-r from-navy via-ocean to-slate-900 px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute right-8 top-8 hidden rounded-full bg-white/10 p-5 text-white/80 md:block">
              <BellAlertIcon className="h-10 w-10" />
            </div>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                <SparklesIcon className="h-4 w-4" />
                Activity center
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">
                Notifications
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                Booking requests, confirmations, messages, reviews, and account updates appear here.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<BellIcon className="h-5 w-5" />}
            label="Total"
            value={pagination.count}
            text="All saved notifications."
          />

          <SummaryCard
            icon={<EnvelopeOpenIcon className="h-5 w-5" />}
            label="Unread"
            value={Math.max(globalUnreadCount, pageUnreadCount)}
            text={globalUnreadCount > 0 ? 'Needs attention.' : 'Everything is read.'}
          />

          <SummaryCard
            icon={<CheckCircleIcon className="h-5 w-5" />}
            label="Latest"
            value={latestNotificationTime}
            text="Most recent update."
          />
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white/80 p-4 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                {pageUnreadCount > 0
                  ? `${pageUnreadCount} unread on this page.`
                  : 'This page is up to date.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadNotifications(pagination.page || 1)}
                disabled={loading || markingAll}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={
                  loading ||
                  markingAll ||
                  (globalUnreadCount === 0 && pageUnreadCount === 0)
                }
                className="inline-flex items-center justify-center rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-60"
              >
                {markingAll ? 'Updating...' : 'Mark all as read'}
              </button>
            </div>
          </div>

          {loading ? <LoadingSkeleton /> : null}

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
            <EmptyState
              icon={<BellAlertIcon className="h-8 w-8" />}
              title="No notifications yet"
              text="Booking updates, messages, and marketplace activity will appear here as soon as something happens."
              actionLabel="Browse boats"
              actionTo="/"
              compact={false}
            />
          ) : null}

          {!loading && !error && notifications.length > 0 ? (
            <>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onOpen={openNotification}
                  />
                ))}
              </div>

              <PaginationControls
                page={pagination.page}
                totalPages={pagination.totalPages}
                count={pagination.count}
                itemLabel="notifications"
                onPrevious={() => setPage(pagination.page - 1)}
                onNext={() => setPage(pagination.page + 1)}
                disabled={loading}
              />
            </>
          ) : null}
        </section>
      </PageContainer>
    </main>
  )
}