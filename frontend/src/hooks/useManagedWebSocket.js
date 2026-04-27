import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function getReconnectDelay(attempt, baseDelayMs, maxDelayMs) {
  return Math.min(baseDelayMs * 2 ** Math.max(0, attempt), maxDelayMs)
}

export function useManagedWebSocket({
  url,
  isEnabled,
  isAuthReady,
  isAuthenticated,
  baseReconnectDelayMs = 3000,
  maxReconnectDelayMs = 30000,
  maxReconnectAttempts = 6,
  onOpen,
  onMessage,
  onClose,
  onError,
  onAuthFailure,
  getMessageAuthFailure,
  getCloseAuthFailure,
}) {
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttemptRef = useRef(0)
  const shouldReconnectRef = useRef(false)
  const authFailureHandledRef = useRef(false)
  const callbacksRef = useRef({
    onOpen,
    onMessage,
    onClose,
    onError,
    onAuthFailure,
    getMessageAuthFailure,
    getCloseAuthFailure,
  })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    callbacksRef.current = {
      onOpen,
      onMessage,
      onClose,
      onError,
      onAuthFailure,
      getMessageAuthFailure,
      getCloseAuthFailure,
    }
  }, [getCloseAuthFailure, getMessageAuthFailure, onAuthFailure, onClose, onError, onMessage, onOpen])

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const handleAuthFailure = useCallback((message) => {
    if (authFailureHandledRef.current) {
      return
    }

    authFailureHandledRef.current = true
    shouldReconnectRef.current = false
    clearReconnectTimeout()
    callbacksRef.current.onAuthFailure?.(message)
  }, [clearReconnectTimeout])

  const disconnect = useCallback(({ allowReconnect = false } = {}) => {
    shouldReconnectRef.current = allowReconnect
    clearReconnectTimeout()

    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }

    if (!allowReconnect) {
      reconnectAttemptRef.current = 0
      setIsConnected(false)
    }
  }, [clearReconnectTimeout])

  const connect = useCallback(() => {
    if (!url || !isEnabled || !isAuthReady || !isAuthenticated || socketRef.current) {
      return
    }

    shouldReconnectRef.current = true
    const socket = new WebSocket(url)

    socket.onopen = () => {
      authFailureHandledRef.current = false
      reconnectAttemptRef.current = 0
      setIsConnected(true)
      callbacksRef.current.onOpen?.(socket)
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        const authFailureMessage = callbacksRef.current.getMessageAuthFailure?.(payload)

        if (authFailureMessage) {
          handleAuthFailure(authFailureMessage)
          return
        }

        callbacksRef.current.onMessage?.(payload, event)
      } catch (error) {
        callbacksRef.current.onError?.(error, { type: 'invalid_payload' })
      }
    }

    socket.onclose = (event) => {
      socketRef.current = null
      setIsConnected(false)
      callbacksRef.current.onClose?.(event)

      const authFailureMessage = callbacksRef.current.getCloseAuthFailure?.(event)
      if (authFailureMessage) {
        handleAuthFailure(authFailureMessage)
        return
      }

      if (!shouldReconnectRef.current || reconnectAttemptRef.current >= maxReconnectAttempts) {
        return
      }

      const delay = getReconnectDelay(
        reconnectAttemptRef.current,
        baseReconnectDelayMs,
        maxReconnectDelayMs
      )
      reconnectAttemptRef.current += 1
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect()
      }, delay)
    }

    socket.onerror = (event) => {
      callbacksRef.current.onError?.(event, { type: 'socket_error' })
      socket.close()
    }

    socketRef.current = socket
  }, [
    baseReconnectDelayMs,
    handleAuthFailure,
    isAuthenticated,
    isAuthReady,
    isEnabled,
    maxReconnectAttempts,
    maxReconnectDelayMs,
    url,
  ])

  useEffect(() => {
    if (!isAuthenticated) {
      authFailureHandledRef.current = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const reconnectIfEligible = () => {
      if (isEnabled && isAuthReady && isAuthenticated) {
        connect()
      }
    }

    const handleOnline = () => reconnectIfEligible()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reconnectIfEligible()
      }
    }

    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [connect, isAuthenticated, isAuthReady, isEnabled])

  const sendJson = useCallback((payload) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false
    }

    socket.send(JSON.stringify(payload))
    return true
  }, [])

  return useMemo(() => ({
    socketRef,
    isConnected,
    connect,
    disconnect,
    sendJson,
  }), [connect, disconnect, isConnected, sendJson])
}
