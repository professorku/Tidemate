function flattenErrorValue(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(flattenErrorValue).filter(Boolean)[0] || null
  }
  if (typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      const message = flattenErrorValue(nestedValue)
      if (message) return message
    }
  }
  return null
}

export function getErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.data || error?.response?.data

  return (
    flattenErrorValue(data?.detail) ||
    flattenErrorValue(data?.message) ||
    flattenErrorValue(data?.non_field_errors) ||
    flattenErrorValue(data) ||
    error?.message ||
    fallback
  )
}
