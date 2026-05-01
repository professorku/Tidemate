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

import { safeInternalPath } from '../../../utils/navigation'

const NOTIFICATION_ICONS = {
  message: ChatBubbleLeftRightIcon,
  booking: CalendarDaysIcon,
  review: StarIcon,
  account: ShieldCheckIcon,
  update: BellIcon,
}

const NOTIFICATION_ICON_CLASSES = {
  message: 'bg-gold/10 text-gold ring-1 ring-gold/20',
  booking: 'bg-gold/10 text-gold ring-1 ring-gold/20',
  review: 'bg-gold/10 text-gold ring-1 ring-gold/20',
  account: 'bg-emerald-400/10 text-emerald-100 ring-1 ring-emerald-300/20',
  update: 'bg-white/10 text-white/70 ring-1 ring-white/10',
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
    navigate(safeInternalPath(notification.target_url))
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
    <div className="absolute right-0 z-50 mt-3 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-gold/20 bg-navy shadow-2xl ring-1 ring-gold/10">
      <div className="border-b border-gold/15 bg-navy px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-white">Notifications</h3>
            <p className="mt-1 text-xs font-medium text-white/60">
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
            className="rounded-full border border-gold/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/15"
          >
            View all
          </button>
        </div>
      </div>

      {previewNotifications.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
            <CheckCircleIcon className="h-6 w-6" />
          </div>

          <p className="mt-3 text-sm font-semibold text-white">
            No notifications yet
          </p>

          <p className="mt-1 text-sm leading-6 text-white/60">
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
              className={`block w-full border-b border-gold/10 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-white/10 ${
                notification.is_read ? 'bg-navy' : 'bg-gold/10'
              }`}
            >
              <div className="flex gap-3">
                <NotificationMiniIcon notification={notification} />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
                      {getNotificationKindLabel(notification)}
                    </span>

                    {!notification.is_read ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold shadow-[0_0_0_3px_rgba(201,161,74,0.18)]" />
                    ) : null}
                  </div>

                  <p
                    className={`mt-1.5 line-clamp-2 text-sm leading-5 ${
                      notification.is_read
                        ? 'text-white/70'
                        : 'font-semibold text-white'
                    }`}
                  >
                    {notification.message}
                  </p>

                  <p className="mt-1.5 text-xs text-white/50">
                    {formatNotificationTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-gold/15 bg-[#071d32]/80 px-4 py-3">
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
          className="text-sm font-semibold text-white/60 transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {markingAll ? 'Updating...' : 'Mark all read'}
        </button>

        <button
          type="button"
          onClick={() => {
            close()
            navigate('/notifications')
          }}
          className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-navy transition hover:bg-gold/90"
        >
          Open activity center
        </button>
      </div>
    </div>
  )
}