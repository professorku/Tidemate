import { formatBoatType } from '../../utils/format/boat'
import { formatDistance, formatPrice } from '../../utils/format/number'

export { formatBoatType, formatDistance, formatPrice }

const ONE_DAY_MS = 1000 * 60 * 60 * 24

export function getNewLabel(createdAt) {
  if (!createdAt) return null

  const createdTime = Date.parse(createdAt)

  if (Number.isNaN(createdTime)) {
    return null
  }

  const diffDays = (Date.now() - createdTime) / ONE_DAY_MS

  if (diffDays < 0) return null
  if (diffDays < 1) return 'New today'
  if (diffDays < 7) return 'New this week'

  return null
}