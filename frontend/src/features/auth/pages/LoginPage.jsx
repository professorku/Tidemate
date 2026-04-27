import { useState } from 'react'
import PageContainer from '../../../components/layout/PageContainer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { loginUser, resendVerificationEmail } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/10'
const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

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
  const [info, setInfo] = useState(initialMessage || (initialEmail ? 'Please verify your email before logging in.' : ''))
  const [resending, setResending] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginUser(form)
      await login()
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid username or password.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!initialEmail) {
      setInfo('Sign up again or use the same email to request a new verification link.')
      return
    }

    setError('')
    setResending(true)

    try {
      const response = await resendVerificationEmail(initialEmail)
      setInfo(response?.detail || 'Verification email sent.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not resend verification email.'))
    } finally {
      setResending(false)
    }
  }

  return (
    <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
      <div className="rounded-[20px] bg-white p-5 shadow-soft md:p-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Log in</h1>
        <p className="mb-5 text-sm text-slate-600">Welcome back aboard.</p>

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

          {info ? <p className="text-sm text-slate-600">{info}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {initialEmail ? (
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="mt-4 text-sm font-semibold text-ocean disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resending ? 'Sending verification email...' : 'Resend verification email'}
          </button>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <Link to="/forgot-password" className="font-semibold text-ocean">
            Forgot password?
          </Link>

          <p className="text-slate-600">
            Need an account?{' '}
            <Link to="/signup" className="font-semibold text-ocean">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PageContainer>
  )
}
