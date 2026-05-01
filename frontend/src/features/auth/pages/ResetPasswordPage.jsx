import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import { submitPasswordReset } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-1.5 block text-sm font-medium text-white/80'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid = searchParams.get('uid') || ''
  const token = searchParams.get('token') || ''
  const hasValidParams = useMemo(() => Boolean(uid && token), [token, uid])

  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!hasValidParams) {
      setError('Reset link is missing or invalid.')
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await submitPasswordReset({
        uid,
        token,
        new_password: form.newPassword,
      })
      setSuccess(response.detail || 'Password reset successful. You can now log in.')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not reset password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
        <div className="rounded-[20px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
          <h1 className="mb-1 text-2xl font-extrabold text-white">Reset password</h1>
          <p className="mb-5 text-sm text-white/70">Choose a new password for your TideMate account.</p>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="reset-password-new">
                New password
              </label>
              <input
                id="reset-password-new"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                placeholder="New password"
                value={form.newPassword}
                onChange={(e) => setForm((current) => ({ ...current, newPassword: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="reset-password-confirm">
                Confirm new password
              </label>
              <input
                id="reset-password-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
              />
            </div>

            {success ? <p className="text-sm text-green-200">{success}</p> : null}
            {error ? <p className="text-sm text-red-200">{error}</p> : null}

            <button
              disabled={loading || !hasValidParams}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Updating password...' : 'Reset password'}
            </button>
          </form>

          {!hasValidParams ? (
            <p className="mt-4 text-sm text-red-200">This reset link is incomplete. Request a new one below.</p>
          ) : null}

          <p className="mt-5 text-sm text-white/70">
            Need a new reset link?{' '}
            <Link to="/forgot-password" className="font-semibold text-gold">
              Request one
            </Link>
          </p>
        </div>
      </PageContainer>
    </main>
  )
}