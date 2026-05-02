import { createContext, useCallback, useMemo, useState } from 'react'
import ToastViewport from '../components/ui/ToastViewport'

const ToastContext = createContext(null)

export const DEFAULT_TOAST_DURATION = 3500
export default ToastContext

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])

  const showToast = useCallback(({ title = '', message, tone = 'info', duration = DEFAULT_TOAST_DURATION }) => {
    if (!message) return null

    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${toasts.length}`

    setToasts((current) => [...current, { id, title, message, tone }])

    window.setTimeout(() => {
      dismissToast(id)
    }, duration)

    return id
  }, [dismissToast, toasts.length])

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}