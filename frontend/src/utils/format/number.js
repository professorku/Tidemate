export function formatCurrency(value, options = {}) {
  const number = Number(value)
  if (Number.isNaN(number)) return value || options.fallback || '—'

  try {
    return new Intl.NumberFormat(options.locale || 'en-NO', {
      style: 'currency',
      currency: options.currency || 'NOK',
      maximumFractionDigits: options.maximumFractionDigits ?? 0,
    }).format(number)
  } catch {
    return `${number} ${options.currency || 'NOK'}`
  }
}

export function formatPrice(value, options = {}) {
  if (value === null || value === undefined || value === '') {
    return options.fallback || '—'
  }

  const number = Number(value)
  if (Number.isNaN(number)) return value

  return new Intl.NumberFormat(options.locale || 'en-NO').format(number)
}

export function formatDistance(value) {
  if (!value) return null

  const number = Number(value)
  if (Number.isNaN(number)) return null

  if (number < 10) return `${number.toFixed(1)} km away`
  return `${Math.round(number)} km away`
}

export function formatRatingStars(value, options = {}) {
  const rating = Number(value)
  if (!rating) return options.fallback || '—'
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`
}
