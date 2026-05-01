import {
  BellAlertIcon,
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
  ShieldCheckIcon,
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
import { safeInternalPath } from '../../../utils/navigation'
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
  message: 'bg-gold/10 text-gold ring-gold/20',
  booking: 'bg-gold/10 text-gold ring-gold/20',
  review: 'bg-gold/10 text-gold ring-gold/20',
  account: 'bg-emerald-400/10 text-emerald-100 ring-emerald-300/20',
  update: 'bg-white/10 text-white/70 ring-white/10',
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
    <div className="rounded-[24px] border border-gold/20 bg-navy p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white/60">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
          {icon}
        </div>
      </div>

      {text ? <p className="mt-3 text-sm leading-6 text-white/55">{text}</p> : null}
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
          ? 'border-gold/15 bg-[#071d32]/70'
          : 'border-gold/35 bg-gold/10 ring-1 ring-gold/20'
      }`}
    >
      <div className="flex gap-4">
        <NotificationIcon notification={notification} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gold/20 bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gold">
              {kindLabel}
            </span>

            {!notification.is_read ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-navy">
                <span className="h-1.5 w-1.5 rounded-full bg-navy" />
                New
              </span>
            ) : null}
          </div>

          <p
            className={`mt-3 text-base leading-7 ${
              notification.is_read ? 'text-white/70' : 'font-semibold text-white'
            }`}
          >
            {notification.message}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span
              className="text-white/50"
              title={formatNotificationFullTime(notification.created_at)}
            >
              {formatNotificationTime(notification.created_at)}
            </span>

            <span className="font-semibold text-gold transition group-hover:text-gold/80">
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
          className="rounded-[28px] border border-gold/15 bg-[#071d32]/70 p-5 shadow-sm md:p-6"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
              <div className="h-5 w-full animate-pulse rounded-full bg-white/10" />
              <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/10" />
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
        <section className="overflow-hidden rounded-[32px] border border-gold/20 bg-navy shadow-soft">
          <div className="relative px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute right-8 top-8 hidden rounded-full bg-[#071d32]/80 p-5 text-gold ring-1 ring-gold/20 md:block">
              <BellAlertIcon className="h-10 w-10" />
            </div>

            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Notifications
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
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

        <section className="rounded-[32px] border border-gold/20 bg-navy p-4 shadow-soft md:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-white">Recent activity</h2>
              <p className="mt-1 text-sm text-white/60">
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
                className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
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