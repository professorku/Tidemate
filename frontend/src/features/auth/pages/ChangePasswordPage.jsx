import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import { changePassword } from '../services/authService'
import { useAuth } from '../../../context/useAuth'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-1.5 block text-sm font-medium text-white/80'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await changePassword({
        current_password: form.currentPassword,
        new_password: form.newPassword,
      })
      await logout()
      navigate('/login', {
        replace: true,
        state: { message: response.detail || 'Password changed successfully. Please log in again.' },
      })
    } catch (err) {
      setError(getErrorMessage(err, 'Could not change password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
        <div className="rounded-[20px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
          <h1 className="mb-1 text-2xl font-extrabold text-white">Change password</h1>
          <p className="mb-5 text-sm text-white/70">Update your password and keep your account secure.</p>

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className={labelClassName} htmlFor="change-password-current">
                Current password
              </label>
              <input
                id="change-password-current"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className={inputClassName}
                placeholder="Current password"
                value={form.currentPassword}
                onChange={(e) => setForm((current) => ({ ...current, currentPassword: e.target.value }))}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="change-password-new">
                New password
              </label>
              <input
                id="change-password-new"
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
              <label className={labelClassName} htmlFor="change-password-confirm">
                Confirm new password
              </label>
              <input
                id="change-password-confirm"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
              />
            </div>

            {error ? <p className="text-sm text-red-200">{error}</p> : null}

            <button
              disabled={loading}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Changing password...' : 'Change password'}
            </button>
          </form>

          <p className="mt-5 text-sm text-white/70">
            <Link to="/profile" className="font-semibold text-gold">
              Back to profile
            </Link>
          </p>
        </div>
      </PageContainer>
    </main>
  )
}