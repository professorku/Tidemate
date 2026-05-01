import { useState } from 'react'
import PageContainer from '../../../components/layout/PageContainer'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'

const inputClassName =
  'w-full rounded-xl border border-gold/25 bg-[#071d32]/80 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25'

const labelClassName = 'mb-1.5 block text-sm font-medium text-white/80'

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

            <button
              disabled={loading}
              className="w-full rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

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