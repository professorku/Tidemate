import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './features/navigation/components/Navbar'
import ProtectedRoute from './features/auth/components/ProtectedRoute'
import AdminRoute from './features/auth/components/AdminRoute'
import RouteLoadingFallback from './components/ui/RouteLoadingFallback'
import RouteErrorBoundary from './components/ui/RouteErrorBoundary'

import {
  AddBoatPage,
  BoatDetailPage,
  BookingDetailPage,
  ChangePasswordPage,
  ConversationPage,
  EditBoatPage,
  EditProfilePage,
  FavoritesPage,
  ForgotPasswordPage,
  HomePage,
  HostBookingsPage,
  LoginPage,
  MessagesPage,
  ModerationPage,
  MyBookingsPage,
  MyBoatsPage,
  NotFoundPage,
  NotificationsPage,
  ProfilePage,
  PublicProfilePage,
  ResetPasswordPage,
  SignupPage,
  VerifyEmailPage,
  PaymentCancelPage,
  PaymentSuccessPage,
} from './routes/lazyPages'


export default function App() {
  return (
    <div className="min-h-screen bg-foam text-ink">
      <Navbar />

      <RouteErrorBoundary>
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
              path="/payments/success"
              element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments/cancelled"
              element={
                <ProtectedRoute>
                  <PaymentCancelPage />
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

            <Route
              path="/moderation"
              element={
                <AdminRoute>
                  <ModerationPage />
                </AdminRoute>
              }
            />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email-change" element={<VerifyEmailPage mode="email-change" />} />

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
      </RouteErrorBoundary>
    </div>
  )
}
