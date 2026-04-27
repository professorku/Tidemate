export function resolveWebSocketBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_WS_BASE_URL?.trim()
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '')
  }

  if (typeof window === 'undefined') {
    return 'ws://localhost:8000'
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}`
}

export function buildWebSocketUrl(path) {
  if (!path) {
    return null
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${resolveWebSocketBaseUrl()}${normalizedPath}`
}

export function getCloseAuthFailure(event, fallbackMessage = 'Your session expired. Please sign in again.') {
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
