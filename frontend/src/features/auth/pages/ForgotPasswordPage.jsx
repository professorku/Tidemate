import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import { requestPasswordReset } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-1.5 block text-sm font-medium text-white/80'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await requestPasswordReset(email)
      setMessage(response.detail || 'If an account exists for that email, a password reset link has been sent.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send password reset email.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
        <div className="rounded-[20px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
          <h1 className="mb-1 text-2xl font-extrabold text-white">Forgot password</h1>
          <p className="mb-5 text-sm text-white/70">Enter your email and we will send you a reset link.</p>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="forgot-password-email">
                Email
              </label>
              <input
                id="forgot-password-email"
                name="email"
                className={inputClassName}
                type="email"
                autoComplete="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {message ? <p className="text-sm text-green-200">{message}</p> : null}
            {error ? <p className="text-sm text-red-200">{error}</p> : null}

            <button
              disabled={loading}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-5 text-sm text-white/70">
            Remembered your password?{' '}
            <Link to="/login" className="font-semibold text-gold">
              Back to login
            </Link>
          </p>
        </div>
      </PageContainer>
    </main>
  )
}