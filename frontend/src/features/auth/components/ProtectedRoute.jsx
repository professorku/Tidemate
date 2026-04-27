import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import LoadingState from '../../../components/ui/LoadingState'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="px-6 py-10">
        <LoadingState
          title="Checking your session"
          text="We are verifying your account before opening this page."
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
