import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageContainer from '../../../components/layout/PageContainer'
import { verifyEmailToken } from '../services/authService'
import { getErrorMessage } from '../../../utils/errors'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Verification link is missing or invalid.')
        return
      }

      try {
        const response = await verifyEmailToken(token)
        setStatus('success')
        setMessage(response.detail || 'Email verified. You can now log in.')
      } catch (error) {
        setStatus('error')
        setMessage(getErrorMessage(error, 'Could not verify email.'))
      }
    }

    void verify()
  }, [token])

  return (
    <PageContainer size="auth" className="py-8 md:py-10" contentClassName="space-y-0">
      <div className="rounded-[20px] bg-white p-5 shadow-soft md:p-6">
        <h1 className="mb-1 text-2xl font-extrabold text-slate-900">Verify email</h1>
        <p className="mb-5 text-sm text-slate-600">Almost there.</p>

        <p className={`text-sm ${status === 'success' ? 'text-green-700' : status === 'error' ? 'text-red-600' : 'text-slate-700'}`}>
          {message}
        </p>

        <div className="mt-5">
          <Link to="/login" className="font-semibold text-ocean">
            Go to login
          </Link>
        </div>
      </div>
    </PageContainer>
  )
}
