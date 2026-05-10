import { useCallback, useRef, useState } from 'react'
import PageContainer from '../../../components/layout/PageContainer'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithGoogle, signupUser } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'
import { useAuth } from '../../../context/useAuth'
import GoogleLoginButton from '../components/GoogleLoginButton'
import TurnstileWidget from '../../../components/auth/TurnstileWidget'

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-1.5 block text-sm font-medium text-white/80'

// Turnstile is enforced only when the site key is configured. Local dev
// without a key can still submit the form normally.
const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim())

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const turnstileRef = useRef(null)

  const handleTurnstileVerify = useCallback((token) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('')
  }, [])

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('')
  }, [])

  // Cloudflare consumes the Turnstile token as soon as the backend forwards
  // it to siteverify — even if some *other* field fails validation. So after
  // any failed attempt we must (a) clear local state to disable the submit
  // button and (b) ask the widget to issue a fresh token.
  const resetTurnstile = useCallback(() => {
    setTurnstileToken('')
    turnstileRef.current?.reset()
  }, [])

  const handleGoogleSuccess = async (credential) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await loginWithGoogle(credential)
      await login()
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not sign up with Google.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = (err) => {
    setError(err?.message || 'Could not start Google login.')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await signupUser(form, turnstileToken)
      setSuccess(response?.detail || 'Account created. Please verify your email before logging in.')
      setTimeout(() => navigate('/login', { state: { email: form.email } }), 1200)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create account.'))
      resetTurnstile()
    } finally {
      setLoading(false)
    }
  }

  const submitDisabled = loading || (turnstileEnabled && !turnstileToken)

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
        <div className="rounded-[20px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
          <h1 className="mb-1 text-2xl font-extrabold text-white">Sign up</h1>
          <p className="mb-5 text-sm text-white/70">Create your TideMate account.</p>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="signup-username">
                Username
              </label>
              <input
                id="signup-username"
                name="username"
                autoComplete="username"
                className={inputClassName}
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                className={inputClassName}
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Password (min. 8 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error ? <p className="text-sm text-red-200">{error}</p> : null}
            {success ? <p className="text-sm text-green-200">{success}</p> : null}

            <div className="flex justify-center pt-1">
              <TurnstileWidget
                ref={turnstileRef}
                theme="dark"
                onVerify={handleTurnstileVerify}
                onExpire={handleTurnstileExpire}
                onError={handleTurnstileError}
              />
            </div>

            <button
              disabled={submitDisabled}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>


          <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
            <span className="h-px flex-1 bg-gold/15" />
            or
            <span className="h-px flex-1 bg-gold/15" />
          </div>

          <GoogleLoginButton
            disabled={loading}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          <p className="mt-5 text-sm text-white/70">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gold">
              Log in
            </Link>
          </p>
        </div>
      </PageContainer>
    </main>
  )
}
