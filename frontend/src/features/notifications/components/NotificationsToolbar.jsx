export default function NotificationsToolbar({
  pageUnreadCount,
  globalUnreadCount,
  loading,
  markingAll,
  onRefresh,
  onMarkAllAsRead,
}) {
  const hasUnread = globalUnreadCount > 0 || pageUnreadCount > 0

  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-white">Recent activity</h2>

        <p className="mt-1 text-sm text-white/60">
          {pageUnreadCount > 0
            ? `${pageUnreadCount} unread on this page.`
            : 'This page is up to date.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || markingAll}
          className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>

        <button
          type="button"
          onClick={onMarkAllAsRead}
          disabled={loading || markingAll || !hasUnread}
          className="inline-flex items-center justify-center rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {markingAll ? 'Updating...' : 'Mark all as read'}
        </button>
      </div>
    </div>
  )
}