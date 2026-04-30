import { useEffect, useRef, useState } from 'react'
import { BellIcon as BellOutline } from '@heroicons/react/24/outline'
import { BellIcon as BellSolid } from '@heroicons/react/24/solid'
import { useNotifications } from '../../../context/useNotifications'
import NotificationsDropdown from './NotificationsDropDown'

export default function NotificationBell() {
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  const previewNotifications = notifications.slice(0, 5)
  const unreadLabel = unreadCount > 9 ? '9+' : unreadCount

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`relative rounded-full border p-2 text-white transition ${
          unreadCount > 0
            ? 'border-gold/40 bg-gold/15 shadow-[0_0_0_4px_rgba(201,161,74,0.12)] hover:bg-gold/25'
            : 'border-white/15 bg-white/10 hover:bg-white/20'
        }`}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
      >
        {unreadCount > 0 ? (
          <BellSolid className="h-5 w-5 text-gold" />
        ) : (
          <BellOutline className="h-5 w-5" />
        )}

        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-extrabold leading-none text-white ring-2 ring-navy">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <NotificationsDropdown
          close={() => setOpen(false)}
          previewNotifications={previewNotifications}
          unreadCount={unreadCount}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
        />
      ) : null}
    </div>
  )
}