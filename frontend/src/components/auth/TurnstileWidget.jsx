import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

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
 * Ref methods:
 *   reset()  — discard the current challenge and start a fresh one. Use this
 *              after a failed login/signup attempt: Cloudflare invalidates
 *              the token as soon as it's been sent to siteverify, so the
 *              widget must issue a new one before the user can submit again.
 *
 * If VITE_TURNSTILE_SITE_KEY is not set, this renders nothing — useful for
 * local dev where you've also left TURNSTILE_SECRET_KEY unset on the backend.
 */
function TurnstileWidget(
  { onVerify, onExpire, onError, theme = 'auto' },
  ref,
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [scriptError, setScriptError] = useState(null)

  // Keep the latest callbacks in refs so the render effect doesn't depend on
  // them. Without this, any parent that forgets to memoize its handlers would
  // make us tear down and re-render the widget on every render.
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onVerifyRef.current = onVerify
  }, [onVerify])

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim()

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        const turnstile = window.turnstile
        const widgetId = widgetIdRef.current
        if (turnstile && widgetId) {
          try {
            turnstile.reset(widgetId)
          } catch {
            // ignore — widget may not be initialised yet
          }
        }
      },
    }),
    [],
  )

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
          callback: (token) => onVerifyRef.current?.(token),
          'expired-callback': () => onExpireRef.current?.(),
          'error-callback': (err) => onErrorRef.current?.(err),
        })
      })
      .catch((err) => {
        if (!cancelled) {
          setScriptError(err)
          onErrorRef.current?.(err)
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
  }, [siteKey, theme])

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

export default forwardRef(TurnstileWidget)
