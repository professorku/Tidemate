import { useEffect, useRef, useState } from 'react'

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let scriptLoadingPromise = null

function ensureTurnstileScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available.'))
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile)
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src^="${TURNSTILE_SCRIPT_SRC.split('?')[0]}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile))
      existing.addEventListener('error', () => reject(new Error('Turnstile script failed to load.')))
      return
    }

    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.turnstile)
    script.onerror = () => reject(new Error('Turnstile script failed to load.'))
    document.head.appendChild(script)
  })

  return scriptLoadingPromise
}

export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  theme = 'auto',
  resetSignal = 0,
}) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [scriptError, setScriptError] = useState(null)

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return undefined
    }

    let cancelled = false

    ensureTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => onVerify?.(token),
          'expired-callback': () => onExpire?.(),
          'error-callback': (err) => onError?.(err),
        })
      })
      .catch((err) => {
        if (!cancelled) {
          setScriptError(err)
          onError?.(err)
        }
      })

    return () => {
      cancelled = true

      const turnstile = window.turnstile
      const widgetId = widgetIdRef.current

      if (turnstile && widgetId !== null && widgetId !== undefined) {
        try {
          turnstile.remove(widgetId)
        } catch {
          // ignore — widget may already be torn down
        }
      }

      widgetIdRef.current = null
    }
  }, [siteKey, theme, onVerify, onExpire, onError])

  useEffect(() => {
    if (!siteKey || !resetSignal) {
      return
    }

    const turnstile = window.turnstile
    const widgetId = widgetIdRef.current

    if (!turnstile || widgetId === null || widgetId === undefined) {
      return
    }

    try {
      turnstile.reset(widgetId)
    } catch (err) {
      onError?.(err)
    }
  }, [resetSignal, siteKey, onError])

  if (!siteKey) {
    return null
  }

  if (scriptError) {
    return (
      <p className="text-xs text-red-300">
        Captcha could not load. Refresh the page or disable browser blockers.
      </p>
    )
  }

  return <div ref={containerRef} className="cf-turnstile" />
}