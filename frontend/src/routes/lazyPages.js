import { lazy } from 'react'


export const pageLoaders = {
  home: () => import('../features/home/pages/HomePage'),
  boatDetail: () => import('../features/boatDetail/pages/BoatDetailPage'),
  publicProfile: () => import('../features/publicProfile/pages/PublicProfilePage'),
  favorites: () => import('../features/favorites/pages/FavoritesPage'),
  addBoat: () => import('../features/addBoat/pages/AddBoatPage'),
  myBoats: () => import('../features/myBoats/pages/MyBoatsPage'),
  editBoat: () => import('../features/editBoat/pages/EditBoatPage'),
  myBookings: () => import('../features/myBookings/pages/MyBookingsPage'),
  bookingDetail: () => import('../features/bookingDetail/pages/BookingDetailPage'),
  messages: () => import('../features/messages/pages/MessagesPage'),
  conversation: () => import('../features/conversation/pages/ConversationPage'),
  hostBookings: () => import('../features/hostBookings/pages/HostBookingsPage'),
  notifications: () => import('../features/notifications/pages/NotificationsPage'),
  profile: () => import('../features/profile/pages/ProfilePage'),
  editProfile: () => import('../features/editProfile/pages/EditProfilePage'),
  moderation: () => import('../features/moderation/pages/ModerationPage'),
  login: () => import('../features/auth/pages/LoginPage'),
  signup: () => import('../features/auth/pages/SignupPage'),
  forgotPassword: () => import('../features/auth/pages/ForgotPasswordPage'),
  resetPassword: () => import('../features/auth/pages/ResetPasswordPage'),
  verifyEmail: () => import('../features/auth/pages/VerifyEmailPage'),
  changePassword: () => import('../features/auth/pages/ChangePasswordPage'),
  notFound: () => import('../features/auth/pages/NotFoundPage'),
}


export function preloadRoute(routeName) {
  const loader = pageLoaders[routeName]

  if (!loader) return

  void loader()
}


export const HomePage = lazy(pageLoaders.home)
export const BoatDetailPage = lazy(pageLoaders.boatDetail)
export const PublicProfilePage = lazy(pageLoaders.publicProfile)
export const FavoritesPage = lazy(pageLoaders.favorites)
export const AddBoatPage = lazy(pageLoaders.addBoat)
export const MyBoatsPage = lazy(pageLoaders.myBoats)
export const EditBoatPage = lazy(pageLoaders.editBoat)
export const MyBookingsPage = lazy(pageLoaders.myBookings)
export const BookingDetailPage = lazy(pageLoaders.bookingDetail)
export const MessagesPage = lazy(pageLoaders.messages)
export const ConversationPage = lazy(pageLoaders.conversation)
export const HostBookingsPage = lazy(pageLoaders.hostBookings)
export const NotificationsPage = lazy(pageLoaders.notifications)
export const ProfilePage = lazy(pageLoaders.profile)
export const EditProfilePage = lazy(pageLoaders.editProfile)
export const ModerationPage = lazy(pageLoaders.moderation)
export const LoginPage = lazy(pageLoaders.login)
export const SignupPage = lazy(pageLoaders.signup)
export const ForgotPasswordPage = lazy(pageLoaders.forgotPassword)
export const ResetPasswordPage = lazy(pageLoaders.resetPassword)
export const VerifyEmailPage = lazy(pageLoaders.verifyEmail)
export const ChangePasswordPage = lazy(pageLoaders.changePassword)
export const NotFoundPage = lazy(pageLoaders.notFound)