export function normalizeNotifications(items) {
  return Array.isArray(items) ? items : []
}

export function upsertNotificationItem(previousItems, notification) {
  if (!notification) {
    return previousItems
  }

  const existingIndex = previousItems.findIndex((item) => item.id === notification.id)
  if (existingIndex === -1) {
    return [notification, ...previousItems]
  }

  const nextItems = [...previousItems]
  nextItems[existingIndex] = {
    ...nextItems[existingIndex],
    ...notification,
  }
  return nextItems
}
