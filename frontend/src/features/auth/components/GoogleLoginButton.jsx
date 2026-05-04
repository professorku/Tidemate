import { useEffect, useRef, useState } from 'react'

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let googleScriptPromise = null

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google login is only available in the browser.'))
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google)
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`)

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.google), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Could not load Google login.')), {
          once: true,
        })
        return
      }

      const script = document.createElement('script')
      script.src = GOOGLE_SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.google)
      script.onerror = () => reject(new Error('Could not load Google login.'))
      document.head.appendChild(script)
    })
  }

  return googleScriptPromise
}

export default function GoogleLoginButton({ onSuccess, onError, disabled = false }) {
  const buttonRef = useRef(null)
  const successRef = useRef(onSuccess)
  const errorRef = useRef(onError)
  const [scriptError, setScriptError] = useState('')

  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || ''

  useEffect(() => {
    successRef.current = onSuccess
    errorRef.current = onError
  }, [onSuccess, onError])

  useEffect(() => {
    if (!clientId || disabled) {
      return undefined
    }

    let cancelled = false

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !buttonRef.current) return

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            const credential = response?.credential

            if (!credential) {
              errorRef.current?.(new Error('Google did not return a login credential.'))
              return
            }

            successRef.current?.(credential)
          },
        })

        buttonRef.current.innerHTML = ''
        google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: buttonRef.current.offsetWidth || 320,
        })
      })
      .catch((error) => {
        if (cancelled) return
        setScriptError(error.message || 'Could not load Google login.')
        errorRef.current?.(error)
      })

    return () => {
      cancelled = true
    }
  }, [clientId, disabled])

  if (!clientId) {
    return null
  }

  return (
    <div className="space-y-2">
      <div
        ref={buttonRef}
        aria-disabled={disabled}
        className={disabled ? 'pointer-events-none opacity-60' : ''}
      />
      {scriptError ? <p className="text-sm text-red-200">{scriptError}</p> : null}
    </div>
  )
}
