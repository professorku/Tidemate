import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  clearSessionHint,
  hasSessionHint,
  markSessionHintActive,
  subscribeToSessionHintChanges,
} from '../utils/auth'
import { fetchCurrentUser } from '../api/domains/users'
import { logoutUser, refreshSession } from '../features/auth/services/authService'

const AuthContext = createContext(null)

export default AuthContext

const SESSION_STATUS = {
  INITIALIZING: 'initializing',
  AUTHENTICATED: 'authenticated',
  ANONYMOUS: 'anonymous',
}

// How long after a user-initiated logout to keep suppressing
// "session expired" toasts that arrive from the WS close path.
const LOGOUT_SUPPRESSION_MS = 3000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionStatus, setSessionStatus] = useState(SESSION_STATUS.INITIALIZING)
  const bootstrapRef = useRef(false)
  const isLoggingOutRef = useRef(false)
  const logoutSuppressionTimerRef = useRef(null)

  const setAnonymousSession = useCallback(({ clearHint = true } = {}) => {
    if (clearHint) {
      clearSessionHint()
    }

    setUser(null)
    setSessionStatus(SESSION_STATUS.ANONYMOUS)
  }, [])

  const setAuthenticatedSession = useCallback((currentUser) => {
    markSessionHintActive()
    setUser(currentUser)
    setSessionStatus(SESSION_STATUS.AUTHENTICATED)
    return currentUser
  }, [])

  const establishSession = useCallback(async () => {
    const currentUser = await fetchCurrentUser()
    return setAuthenticatedSession(currentUser)
  }, [setAuthenticatedSession])

  const bootstrapSession = useCallback(async () => {
    setLoading(true)

    try {
      if (hasSessionHint()) {
        await refreshSession()
      }

      await establishSession()
    } catch {
      setAnonymousSession()
    } finally {
      setLoading(false)
    }
  }, [establishSession, setAnonymousSession])

  useEffect(() => {
    if (bootstrapRef.current) {
      return
    }

    bootstrapRef.current = true
    void bootstrapSession()
  }, [bootstrapSession])

  useEffect(() => {
    return subscribeToSessionHintChanges((isActive) => {
      if (!isActive) {
        setUser(null)
        setSessionStatus(SESSION_STATUS.ANONYMOUS)
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    return () => {
      if (logoutSuppressionTimerRef.current) {
        window.clearTimeout(logoutSuppressionTimerRef.current)
      }
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      return await establishSession()
    } catch {
      setAnonymousSession()
      return null
    }
  }, [establishSession, setAnonymousSession])

  const login = useCallback(async () => {
    setLoading(true)

    try {
      return await establishSession()
    } catch {
      setAnonymousSession()
      throw new Error('Unable to restore your session.')
    } finally {
      setLoading(false)
    }
  }, [establishSession, setAnonymousSession])

  const logout = useCallback(async () => {
    isLoggingOutRef.current = true

    if (logoutSuppressionTimerRef.current) {
      window.clearTimeout(logoutSuppressionTimerRef.current)
      logoutSuppressionTimerRef.current = null
    }

    setLoading(true)

    try {
      await logoutUser()
    } catch {
      // Clear local auth state even if the server-side logout request fails.
    } finally {
      setAnonymousSession()
      setLoading(false)

      // Keep suppressing the WS auth-failure toast for a short window
      // so any 4401 close that arrives after this point is silenced.
      logoutSuppressionTimerRef.current = window.setTimeout(() => {
        isLoggingOutRef.current = false
        logoutSuppressionTimerRef.current = null
      }, LOGOUT_SUPPRESSION_MS)
    }
  }, [setAnonymousSession])

  const expireSession = useCallback(() => {
    setAnonymousSession()
  }, [setAnonymousSession])

  const isLogoutInProgress = useCallback(() => isLoggingOutRef.current, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: sessionStatus === SESSION_STATUS.AUTHENTICATED,
      isAuthReady: sessionStatus !== SESSION_STATUS.INITIALIZING,
      sessionStatus,
      login,
      logout,
      expireSession,
      refreshUser,
      bootstrapSession,
      isLogoutInProgress,
    }),
    [
      user,
      loading,
      sessionStatus,
      login,
      logout,
      expireSession,
      refreshUser,
      bootstrapSession,
      isLogoutInProgress,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
