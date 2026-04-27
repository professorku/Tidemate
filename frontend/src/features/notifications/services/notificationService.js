import { apiGet, apiPatch, apiPost, toPaginatedData } from '../../../api/client'

export async function listNotifications(params) {
  const data = await apiGet('/notifications/', { params })
  return toPaginatedData(data, { fallbackPageSize: Number(params?.page_size || 12) })
}

export function markNotificationRead(notificationId) {
  return apiPatch(`/notifications/${notificationId}/read/`)
}

export function markAllNotificationsRead() {
  return apiPost('/notifications/mark-all-read/')
}
