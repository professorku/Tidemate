import PaginationControls from '../../../components/ui/PaginationControls'
import NotificationItem from './NotificationItem'

export default function NotificationList({
  notifications,
  pagination,
  loading,
  onOpenNotification,
  onPageChange,
}) {
  return (
    <>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onOpen={onOpenNotification}
          />
        ))}
      </div>

      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        count={pagination.count}
        itemLabel="notifications"
        onPrevious={() => onPageChange(pagination.page - 1)}
        onNext={() => onPageChange(pagination.page + 1)}
        disabled={loading}
      />
    </>
  )
}