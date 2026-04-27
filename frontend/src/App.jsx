import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './features/navigation/components/Navbar'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import RouteLoadingFallback from './components/ui/RouteLoadingFallback'

const HomePage = lazy(() => import('./features/home/pages/HomePage'))
const BoatDetailPage = lazy(() => import('./features/boatDetail/pages/BoatDetailPage'))
const AddBoatPage = lazy(() => import('./features/addBoat/pages/AddBoatPage'))
const EditBoatPage = lazy(() => import('./features/editBoat/pages/EditBoatPage'))
const EditProfilePage = lazy(() => import('./features/editProfile/pages/EditProfilePage'))
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'))
const SignupPage = lazy(() => import('./features/auth/pages/SignupPage'))
const MyBoatsPage = lazy(() => import('./features/myBoats/pages/MyBoatsPage'))
const MyBookingsPage = lazy(() => import('./features/myBookings/pages/MyBookingsPage'))
const BookingDetailPage = lazy(() => import('./features/bookingDetail/pages/BookingDetailPage'))
const HostBookingsPage = lazy(() => import('./features/hostBookings/pages/HostBookingsPage'))
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'))
const MessagesPage = lazy(() => import('./features/messages/pages/MessagesPage'))
const ConversationPage = lazy(() => import('./features/conversation/pages/ConversationPage'))
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'))
const PublicProfilePage = lazy(() => import('./features/publicProfile/pages/PublicProfilePage'))
const FavoritesPage = lazy(() => import('./features/favorites/pages/FavoritesPage'))
const VerifyEmailPage = lazy(() => import('./features/auth/pages/VerifyEmailPage'))
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage'))
const ChangePasswordPage = lazy(() => import('./features/auth/pages/ChangePasswordPage'))
const NotFoundPage = lazy(() => import('./features/auth/pages/NotFoundPage'))

export default function App() {
  return (
    <div className="min-h-screen bg-foam text-ink">
      <Navbar />

      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/boats/:id" element={<BoatDetailPage />} />
          <Route path="/users/:id" element={<PublicProfilePage />} />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-boat"
            element={
              <ProtectedRoute>
                <AddBoatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-boats"
            element={
              <ProtectedRoute>
                <MyBoatsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-boats/:id/edit"
            element={
              <ProtectedRoute>
                <EditBoatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages/:id"
            element={
              <ProtectedRoute>
                <ConversationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/host-bookings"
            element={
              <ProtectedRoute>
                <HostBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}
