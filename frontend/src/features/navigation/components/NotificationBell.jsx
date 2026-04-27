import { useState } from 'react'
import { BellIcon as BellOutline } from '@heroicons/react/24/outline'
import { BellIcon as BellSolid } from '@heroicons/react/24/solid'
import { useNotifications } from '../../../context/useNotifications'
import NotificationsDropdown from './NotificationsDropDown'

export default function NotificationBell() {
  const { unreadCount, notifications, markAsRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const unread = unreadCount
  const previewNotifications = notifications.slice(0, 5)

  const formatNotificationTime = (dateString) => {
    if (!dateString) return ''

    const date = new Date(dateString)

    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Notifications"
      >
        {unread > 0 ? (
          <BellSolid className="h-5 w-5 text-gold" />
        ) : (
          <BellOutline className="h-5 w-5" />
        )}

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-600 px-1 text-center text-[11px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <NotificationsDropdown
          close={() => setOpen(false)}
          previewNotifications={previewNotifications}
          markAsRead={markAsRead}
          formatNotificationTime={formatNotificationTime}
        />
      )}
    </div>
  )
}