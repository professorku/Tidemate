import { useNavigate } from 'react-router-dom'

export default function NotificationsDropdown({
  close,
  previewNotifications,
  markAsRead,
  formatNotificationTime,
}) {
  const navigate = useNavigate()

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

  return (
    <div className="absolute right-0 mt-2.5 w-[340px] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-500">Latest 5 updates</p>
        </div>

        <button
          type="button"
          onClick={() => {
            close()
            navigate('/notifications')
          }}
          className="text-sm font-semibold text-navy transition hover:text-gold"
        >
          View all
        </button>
      </div>

      {previewNotifications.length === 0 ? (
        <div className="px-4 py-5 text-sm text-slate-500">
          No notifications yet.
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto">
          {previewNotifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-amber-50 ${
                notification.is_read
                  ? 'bg-white'
                  : 'bg-amber-100/80 ring-1 ring-inset ring-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p
                  className={`text-sm leading-5 ${
                    notification.is_read
                      ? 'text-slate-800'
                      : 'font-medium text-slate-900'
                  }`}
                >
                  {notification.message}
                </p>

                {!notification.is_read ? (
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gold shadow-[0_0_0_3px_rgba(245,158,11,0.18)]" />
                ) : null}
              </div>

              <p className="mt-1.5 text-xs text-slate-500">
                {formatNotificationTime(notification.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}