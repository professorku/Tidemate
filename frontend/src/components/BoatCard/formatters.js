import { formatBoatType } from '../../utils/format/boat'
import { formatDistance, formatPrice } from '../../utils/format/number'

export { formatBoatType, formatDistance, formatPrice }

export function getNewLabel(createdAt) {
  if (!createdAt) return null

  const created = new Date(createdAt)
  const now = new Date()

  const diffDays = (now - created) / (1000 * 60 * 60 * 24)

  if (diffDays < 1) return 'New today'
  if (diffDays < 7) return 'New this week'
  if (diffDays <= 14) return 'New'

  return null
}
