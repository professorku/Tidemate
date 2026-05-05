import { Navigate, useLocation } from 'react-router-dom'
import LoadingState from '../../../components/ui/LoadingState'
import { useAuth } from '../../../context/useAuth'


export default function AdminRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="px-6 py-10">
        <LoadingState
          title="Checking moderator access"
          text="We are verifying your account before opening this page."
        />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!user?.is_staff) {
    return <Navigate to="/" replace />
  }

  return children
}