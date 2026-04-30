import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import {
  formatNotificationTime,
  getNotificationKind,
  getNotificationKindLabel,
} from '../../notifications/utils/notificationPage'

const NOTIFICATION_ICONS = {
  message: ChatBubbleLeftRightIcon,
  booking: CalendarDaysIcon,
  review: StarIcon,
  account: ShieldCheckIcon,
  update: BellIcon,
}

const NOTIFICATION_ICON_CLASSES = {
  message: 'bg-sky-50 text-sky-700',
  booking: 'bg-amber-50 text-amber-700',
  review: 'bg-violet-50 text-violet-700',
  account: 'bg-emerald-50 text-emerald-700',
  update: 'bg-slate-100 text-slate-700',
}

function NotificationMiniIcon({ notification }) {
  const kind = getNotificationKind(notification)
  const Icon = NOTIFICATION_ICONS[kind] || BellIcon

  return (
    <div
      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
        NOTIFICATION_ICON_CLASSES[kind] || NOTIFICATION_ICON_CLASSES.update
      }`}
    >
      <Icon className="h-4 w-4" />
    </div>
  )
}

export default function NotificationsDropdown({
  close,
  previewNotifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
}) {
  const navigate = useNavigate()
  const [markingAll, setMarkingAll] = useState(false)

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markAsRead(notification.id)
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }

    close()
    navigate(notification.target_url || '/notifications')
  }

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return

    try {
      setMarkingAll(true)
      await markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="absolute right-0 z-50 mt-3 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl ring-1 ring-slate-900/5">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {unreadCount > 0
                ? `${unreadCount} unread ${
                    unreadCount === 1 ? 'update' : 'updates'
                  }`
                : 'Everything is up to date'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              close()
              navigate('/notifications')
            }}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
          >
            View all
          </button>
        </div>
      </div>

      {previewNotifications.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <CheckCircleIcon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            No notifications yet
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Booking updates and new messages will show up here.
          </p>
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          {previewNotifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`block w-full border-b border-slate-100 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-amber-50/70 ${
                notification.is_read ? 'bg-white' : 'bg-amber-50'
              }`}
            >
              <div className="flex gap-3">
                <NotificationMiniIcon notification={notification} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {getNotificationKindLabel(notification)}
                    </span>

                    {!notification.is_read ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold shadow-[0_0_0_3px_rgba(201,161,74,0.18)]" />
                    ) : null}
                  </div>

                  <p
                    className={`mt-1.5 line-clamp-2 text-sm leading-5 ${
                      notification.is_read
                        ? 'text-slate-700'
                        : 'font-semibold text-slate-950'
                    }`}
                  >
                    {notification.message}
                  </p>

                  <p className="mt-1.5 text-xs text-slate-500">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3">
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
          className="text-sm font-semibold text-slate-600 transition hover:text-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? 'Updating...' : 'Mark all read'}
        </button>

        <button
          type="button"
          onClick={() => {
            close()
            navigate('/notifications')
          }}
          className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-ocean"
        >
          Open activity center
        </button>
      </div>
    </div>
  )
}