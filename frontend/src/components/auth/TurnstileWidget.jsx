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

/**
 * Cloudflare Turnstile widget.
 *
 * Props:
 *   onVerify(token: string)  — fires when Cloudflare returns a token
 *   onExpire()               — fires when the token expires (~5 min)
 *   onError(err)             — fires on widget/script errors
 *   theme: 'light' | 'dark' | 'auto' (default 'auto')
 *
 * If VITE_TURNSTILE_SITE_KEY is not set, this renders nothing — useful for
 * local dev where you've also left TURNSTILE_SECRET_KEY unset on the backend.
 */
export default function TurnstileWidget({
  onVerify,
  onExpire,
  onError,
  theme = 'auto',
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
      if (turnstile && widgetId) {
        try {
          turnstile.remove(widgetId)
        } catch {
          // ignore — widget may already be torn down
        }
      }
      widgetIdRef.current = null
    }
  }, [siteKey, theme, onVerify, onExpire, onError])

  if (!siteKey) {
    // Site key not configured — silently render nothing. Backend will also
    // be in bypass mode in this state (TURNSTILE_SECRET_KEY unset).
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
