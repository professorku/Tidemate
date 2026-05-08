import { useCallback, useState } from 'react'
import PageContainer from '../../../components/layout/PageContainer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { loginUser, loginWithGoogle, resendVerificationEmail } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'
import GoogleLoginButton from '../components/GoogleLoginButton'
import TurnstileWidget from '../../../components/auth/TurnstileWidget'

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-1.5 block text-sm font-medium text-white/80'

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim())

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/'
  const initialEmail = location.state?.email || ''
  const initialMessage = location.state?.message || ''

  const [form, setForm] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [info, setInfo] = useState(
    initialMessage || (initialEmail ? 'Please verify your email before logging in.' : '')
  )
  const [resending, setResending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const handleTurnstileVerify = useCallback((token) => {
    setTurnstileToken(token)
  }, [])

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('')
  }, [])

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken('')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginUser(form, turnstileToken)
      await login()
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid username or password.'))
      // Cloudflare invalidates the token after one verification attempt,
      // so reset state and let the widget issue a new one.
      setTurnstileToken('')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential) => {
    setError('')
    setInfo('')
    setLoading(true)

    try {
      await loginWithGoogle(credential)
      await login()
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not log in with Google.'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = (err) => {
    setError(err?.message || 'Could not start Google login.')
  }

  const handleResendVerification = async () => {
    if (!initialEmail) {
      setInfo('Sign up again or use the same email to request a new verification link.')
      return
    }

    setError('')
    setResending(true)

    try {
      const response = await resendVerificationEmail(initialEmail, turnstileToken)
      setInfo(response?.detail || 'Verification email sent.')
      setTurnstileToken('')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend verification email.'))
      setTurnstileToken('')
    } finally {
      setResending(false)
    }
  }

  const submitDisabled = loading || (turnstileEnabled && !turnstileToken)
  const resendDisabled = resending || (turnstileEnabled && !turnstileToken)

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
        <div className="rounded-[20px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
          <h1 className="mb-1 text-2xl font-extrabold text-white">Log in</h1>
          <p className="mb-5 text-sm text-white/70">Welcome back aboard.</p>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="login-username">
                Username
              </label>
              <input
                id="login-username"
                name="username"
                autoComplete="username"
                className={inputClassName}
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={inputClassName}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {info ? <p className="text-sm text-white/70">{info}</p> : null}
            {error ? <p className="text-sm text-red-200">{error}</p> : null}

            <div className="flex justify-center pt-1">
              <TurnstileWidget
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
              {loading ? 'Logging in...' : 'Log in'}
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

          {initialEmail ? (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendDisabled}
              className="mt-4 text-sm font-semibold text-gold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? 'Sending verification email...' : 'Resend verification email'}
            </button>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <Link to="/forgot-password" className="font-semibold text-gold">
              Forgot password?
            </Link>

            <p className="text-white/70">
              Need an account?{' '}
              <Link to="/signup" className="font-semibold text-gold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
