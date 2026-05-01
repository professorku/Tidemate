function stripTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function isAbsoluteWebSocketUrl(value) {
  return /^wss?:\/\//i.test(value)
}

function isAbsoluteHttpUrl(value) {
  return /^https?:\/\//i.test(value)
}

function toWebSocketBaseUrl(value) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return null
  }

  if (trimmedValue.startsWith('https://')) {
    return stripTrailingSlash(trimmedValue.replace(/^https:\/\//, 'wss://'))
  }

  if (trimmedValue.startsWith('http://')) {
    return stripTrailingSlash(trimmedValue.replace(/^http:\/\//, 'ws://'))
  }

  if (isAbsoluteWebSocketUrl(trimmedValue)) {
    return stripTrailingSlash(trimmedValue)
  }

  return stripTrailingSlash(trimmedValue)
}

function getSameOriginWebSocketBaseUrl() {
  if (typeof window === 'undefined') {
    return 'ws://localhost:8000'
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}`
}

function getWebSocketBaseUrlFromApiBaseUrl() {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredApiBaseUrl || configuredApiBaseUrl.startsWith('/')) {
    return null
  }

  if (!isAbsoluteHttpUrl(configuredApiBaseUrl)) {
    return null
  }

  try {
    const apiUrl = new URL(configuredApiBaseUrl)

    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:'

    return `${protocol}//${apiUrl.host}`
  } catch {
    return null
  }
}

export function resolveWebSocketBaseUrl() {
  const configuredWebSocketBaseUrl = toWebSocketBaseUrl(
    import.meta.env.VITE_WS_BASE_URL
  )

  if (configuredWebSocketBaseUrl) {
    return configuredWebSocketBaseUrl
  }

  const apiBasedWebSocketBaseUrl = getWebSocketBaseUrlFromApiBaseUrl()

  if (apiBasedWebSocketBaseUrl) {
    return apiBasedWebSocketBaseUrl
  }

  return getSameOriginWebSocketBaseUrl()
}

export function buildWebSocketUrl(path) {
  if (!path) {
    return null
  }

  if (isAbsoluteWebSocketUrl(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${resolveWebSocketBaseUrl()}${normalizedPath}`
}

export function getCloseAuthFailure(
  event,
  fallbackMessage = 'Your session expired. Please sign in again.'
) {
  return event?.code === 4401 ? fallbackMessage : null
}

export function getSessionRevokedAuthFailure(
  payload,
  fallbackMessage = 'This session was revoked. Please sign in again.'
) {
  return payload?.type === 'session_revoked'
    ? payload.detail || fallbackMessage
    : null
}