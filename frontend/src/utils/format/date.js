export function formatDate(value, options = {}) {
  if (!value) return options.fallback ?? ''

  try {
    return new Date(value).toLocaleDateString(options.locale || 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      ...options.dateOptions,
    })
  } catch {
    return options.fallback ?? value
  }
}

export function formatDateTime(value, options = {}) {
  if (!value) return options.fallback ?? ''

  try {
    return new Date(value).toLocaleString(options.locale || 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options.dateOptions,
    })
  } catch {
    return options.fallback ?? value
  }
}

export function formatDateRange(start, end, options = {}) {
  const separator = options.separator || ' – '
  return `${formatDate(start, options)}${separator}${formatDate(end, options)}`
}

export function formatMemberSince(value, options = {}) {
  if (!value) return options.fallback ?? 'Recently joined'

  try {
    return new Date(value).toLocaleDateString(options.locale || 'en-US', {
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return options.fallback ?? 'Recently joined'
  }
}
