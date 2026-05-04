import {
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { getNotificationKind } from '../utils/notificationPage'

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

export default function NotificationIcon({ notification }) {
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