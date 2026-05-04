import { BellAlertIcon } from '@heroicons/react/24/outline'
import EmptyState from '../../../components/ui/EmptyState'

export default function EmptyNotificationsState() {
  return (
    <EmptyState
      icon={<BellAlertIcon className="h-8 w-8" />}
      title="No notifications yet"
      text="Booking updates, messages, and marketplace activity will appear here as soon as something happens."
      actionLabel="Browse boats"
      actionTo="/"
      compact={false}
    />
  )
}