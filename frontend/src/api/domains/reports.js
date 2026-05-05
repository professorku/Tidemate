import { apiPost } from '../client'


export function createReport({ targetType, targetId, reason, details = '' }) {
  return apiPost('/reports/', {
    target_type: targetType,
    target_id: Number(targetId),
    reason,
    details,
  })
}