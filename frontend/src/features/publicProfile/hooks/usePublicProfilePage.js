import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import { useToast } from '../../../context/useToast'
import { useReviewableBookings } from '../../../hooks/useReviewableBookings'
import { queryKeys } from '../../../query/keys'
import { getErrorMessage } from '../../../utils/errors'
import { startDirectConversation } from '../../../api/domains/chat'
import { getListingsByHost } from '../../../api/domains/listings'
import { createEmptyReviewPage, getUserReviews } from '../../../api/domains/reviews'
import { getPublicUserProfile, toggleBlockUser, toggleCrewmate } from '../../../api/domains/users'

export default function usePublicProfilePage(id) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const { reviewableBookings, refreshReviewableBookings } = useReviewableBookings()
  const [actionMessage, setActionMessage] = useState('')
  const [reviewsPage, setReviewsPage] = useState(1)

  const profileQuery = useQuery({
    queryKey: queryKeys.users.publicProfile(id),
    queryFn: () => getPublicUserProfile(id),
    enabled: Boolean(id),
  })

  const reviewsQuery = useQuery({
    queryKey: queryKeys.users.reviews(id, reviewsPage),
    queryFn: () => getUserReviews(id, { page: reviewsPage }),
    enabled: Boolean(id),
  })

  const boatsQuery = useQuery({
    queryKey: queryKeys.listings.byHost(id),
    queryFn: () => getListingsByHost(id),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (!isAuthenticated) return
    refreshReviewableBookings()
  }, [isAuthenticated, refreshReviewableBookings])

  const reloadPage = async ({ page = reviewsPage } = {}) => {
    setActionMessage('')
    if (page !== reviewsPage) {
      setReviewsPage(page)
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.publicProfile(id) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.reviews(id, page) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byHost(id) }),
    ])
    if (isAuthenticated) {
      await refreshReviewableBookings()
    }
  }

  const startMessageMutation = useMutation({
    mutationFn: () => startDirectConversation(id),
    onSuccess: (res) => {
      navigate(`/messages/${res.conversation.id}`)
    },
    onError: (err) => {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not start conversation.') })
    },
  })

  const crewMutation = useMutation({
    mutationFn: () => toggleCrewmate(id),
    onSuccess: async () => {
      const previous = queryClient.getQueryData(queryKeys.users.publicProfile(id))
      const nextCrewState = !previous?.relationship?.is_crewmate
      queryClient.setQueryData(queryKeys.users.publicProfile(id), (current) => {
        if (!current) return current
        return {
          ...current,
          relationship: {
            ...current.relationship,
            is_crewmate: nextCrewState,
          },
        }
      })
      setActionMessage(nextCrewState ? 'User added to your crew.' : 'User removed from your crew.')
    },
    onError: (err) => {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not update crew status.') })
    },
  })

  const blockMutation = useMutation({
    mutationFn: () => toggleBlockUser(id),
    onSuccess: async (res) => {
      await reloadPage({ silent: true, page: reviewsPage })
      setActionMessage(res?.detail || 'User relationship updated.')
    },
    onError: (err) => {
      showToast({ tone: 'error', message: getErrorMessage(err, 'Could not update block status.') })
    },
  })

  const profile = profileQuery.data || null
  const relationship = useMemo(() => profile?.relationship || {}, [profile])

  const eligibleReviewableBookings = useMemo(() => {
    return reviewableBookings.filter(
      (booking) =>
        Number(booking.target_user_id) === Number(id) &&
        booking.can_review_user === true
    )
  }, [id, reviewableBookings])

  const isMe = Boolean(relationship.is_me)
  const isBlocked = Boolean(relationship.is_blocked)
  const hasBlockedYou = Boolean(relationship.has_blocked_you)
  const isCrewmate = Boolean(relationship.is_crewmate)
  const canMessage = Boolean(relationship.can_message) && !isBlocked && !hasBlockedYou

  return {
    profile,
    reviewsData: reviewsQuery.data || createEmptyReviewPage(),
    reviewsPage,
    boats: boatsQuery.data || [],
    reviewableBookings: eligibleReviewableBookings,
    loading: profileQuery.isLoading || reviewsQuery.isLoading || boatsQuery.isLoading,
    refreshing: profileQuery.isFetching || reviewsQuery.isFetching || boatsQuery.isFetching,
    error:
      getErrorMessage(profileQuery.error, '') ||
      getErrorMessage(reviewsQuery.error, '') ||
      getErrorMessage(boatsQuery.error, 'Could not load this profile.'),
    actionLoading:
      (startMessageMutation.isPending && 'message') ||
      (crewMutation.isPending && 'crew') ||
      (blockMutation.isPending && 'block') ||
      '',
    actionMessage,
    isMe,
    isBlocked,
    hasBlockedYou,
    isCrewmate,
    canMessage,
    handleStartMessage: () => startMessageMutation.mutateAsync(),
    handleToggleCrew: () => {
      setActionMessage('')
      return crewMutation.mutateAsync()
    },
    handleToggleBlock: () => {
      setActionMessage('')
      return blockMutation.mutateAsync()
    },
    reloadPage,
  }
}
