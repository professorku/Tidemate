import {
  formatNotificationFullTime,
  formatNotificationTime,
  getNotificationKindLabel,
} from '../utils/notificationPage'
import NotificationIcon from './NotificationIcon'

export default function NotificationItem({ notification, onOpen }) {
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