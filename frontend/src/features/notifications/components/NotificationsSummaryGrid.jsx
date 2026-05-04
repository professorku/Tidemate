import {
  BellIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline'
import NotificationSummaryCard from './NotificationSummaryCard'

export default function NotificationsSummaryGrid({
  totalCount,
  unreadCount,
  pageUnreadCount,
  latestNotificationTime,
}) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <NotificationSummaryCard
        icon={<BellIcon className="h-5 w-5" />}
        label="Total"
        value={totalCount}
        text="All saved notifications."
      />

      <NotificationSummaryCard
        icon={<EnvelopeOpenIcon className="h-5 w-5" />}
        label="Unread"
        value={unreadCount}
        text={unreadCount > 0 ? 'Needs attention.' : 'Everything is read.'}
      />

      <NotificationSummaryCard
        icon={<CheckCircleIcon className="h-5 w-5" />}
        label="Latest"
        value={latestNotificationTime}
        text={pageUnreadCount > 0 ? 'Recent unread activity.' : 'Most recent update.'}
      />
    </section>
  )
}