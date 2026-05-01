import { formatBoatType } from '../../../utils/format/boat'
import { formatCurrency } from '../../../utils/format/number'

export function formatBoatTypeLabel(value) {
  return formatBoatType(value)
}

export function formatMoney(value) {
  return formatCurrency(value, {
    locale: 'en-NO',
    currency: 'NOK',
    maximumFractionDigits: 0,
  })
}

export function getGuestLabel(value) {
  const guests = Number(value)

  if (!Number.isFinite(guests) || guests <= 0) {
    return 'Guests not set'
  }

  return `${guests} guest${guests === 1 ? '' : 's'}`
}

export function getImageCount(boat) {
  const imageCount =
    Array.isArray(boat?.images) && boat.images.length > 0
      ? boat.images.length
      : boat?.image
        ? 1
        : 0

  return `${imageCount} photo${imageCount === 1 ? '' : 's'}`
}

export function formatRatingSummary(reviewsData) {
  const rating = Number(reviewsData?.average_rating)
  const count = Number(reviewsData?.review_count || 0)

  if (!rating || count === 0) {
    return 'New listing'
  }

  return `★ ${rating.toFixed(1)} · ${count} review${count === 1 ? '' : 's'}`
}