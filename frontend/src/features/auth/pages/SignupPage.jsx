import { useState } from 'react'
import PageContainer from '../../../components/layout/PageContainer'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName = 'w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/10'
const labelClassName = 'mb-1.5 block text-sm font-medium text-slate-700'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await signupUser(form)
      setSuccess(response?.detail || 'Account created. Please verify your email before logging in.')
      setTimeout(() => navigate('/login', { state: { email: form.email } }), 1200)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create account.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
      <div className="rounded-[20px] bg-white p-5 shadow-soft md:p-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Sign up</h1>
        <p className="mb-5 text-sm text-slate-600">Create your TideMate account.</p>

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

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-700">{success}</p> : null}

          <button
            disabled={loading}
            className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ocean">
            Log in
          </Link>
        </p>
      </div>
    </PageContainer>
  )
}
