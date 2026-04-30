import { formatMemberSince as baseFormatMemberSince } from '../../../utils/format/date'
import { formatCurrency } from '../../../utils/format/number'

export function formatMemberSince(value) {
  return baseFormatMemberSince(value, { locale: 'en-GB' })
}

export function formatMoney(value) {
  return formatCurrency(value, { locale: 'en-NO', currency: 'NOK' })
}

export function formatAverageRating(value, options = {}) {
  const rating = Number(value)

  if (!rating) {
    return options.compact ? 'New' : 'No ratings yet'
  }

  const formatted = rating.toFixed(1)

  return options.compact ? formatted : `${formatted} average rating`
}

export function getProfileInitials(profile) {
  const username = profile?.username || 'TM'
  return username.trim().slice(0, 2).toUpperCase() || 'TM'
}

export function getMissingProfileItems(profile) {
  if (!profile) return []

  const missing = []

  if (!profile.avatar) missing.push('profile photo')
  if (!profile.location) missing.push('location')
  if (!profile.bio) missing.push('bio')
  if (!profile.email) missing.push('email')

  return missing
}

export function getProfileCompletion(profile) {
  if (!profile) return 0

  let score = 0

  if (profile.avatar) score += 1
  if (profile.location) score += 1
  if (profile.bio) score += 1
  if (profile.email) score += 1

  return Math.round((score / 4) * 100)
}