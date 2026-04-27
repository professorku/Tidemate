import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import { changePassword } from '../services/authService'
import { useAuth } from '../../../context/useAuth'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/10'
const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

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
    <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
      <div className="rounded-[20px] bg-white p-5 shadow-soft md:p-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Change password</h1>
        <p className="mb-5 text-sm text-slate-600">Update your password and keep your account secure.</p>

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

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Changing password...' : 'Change password'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          <Link to="/profile" className="font-semibold text-ocean">
            Back to profile
          </Link>
        </p>
      </div>
    </PageContainer>
  )
}
