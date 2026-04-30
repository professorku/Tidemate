import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { getListingsByHost } from '../../../api/domains/listings'
import { patchCurrentUser } from '../../../api/domains/users'
import { createEmptyReviewPage, getUserReviews } from '../../../api/domains/reviews'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'
import {
  getMissingProfileItems,
  getProfileCompletion,
  getProfileInitials,
} from '../utils/profileFormatters'

export default function useProfilePageData() {
  const { user, setUser } = useAuth()
  const [reviewsPage, setReviewsPage] = useState(1)
  const queryClient = useQueryClient()

  const reviewsQuery = useQuery({
    queryKey: queryKeys.users.reviews(user?.id, reviewsPage),
    queryFn: () => getUserReviews(user.id, { page: reviewsPage }),
    enabled: Boolean(user?.id),
  })

  const boatsQuery = useQuery({
    queryKey: queryKeys.listings.byHost(user?.id),
    queryFn: () => getListingsByHost(user.id),
    enabled: Boolean(user?.id),
  })

  const avatarMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('avatar_upload', file)
      return patchCurrentUser(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (updatedProfile) => {
      setUser(updatedProfile)
      queryClient.setQueryData(queryKeys.users.current, updatedProfile)
    },
  })

  const initials = useMemo(() => getProfileInitials(user), [user])

  const profileCompletion = useMemo(() => getProfileCompletion(user), [user])

  const missingProfileItems = useMemo(() => getMissingProfileItems(user), [user])

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await avatarMutation.mutateAsync(file)
    } finally {
      event.target.value = ''
    }
  }

  const reload = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current }),
      queryClient.invalidateQueries({ queryKey: queryKeys.users.reviews(user?.id, reviewsPage) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.byHost(user?.id) }),
    ])
  }

  const loading = Boolean(user?.id) && (reviewsQuery.isLoading || boatsQuery.isLoading)

  const error =
    getErrorMessage(reviewsQuery.error, '') ||
    getErrorMessage(boatsQuery.error, '') ||
    getErrorMessage(avatarMutation.error, '')

  return {
    profile: user,
    reviewsData: reviewsQuery.data || createEmptyReviewPage(),
    reviewsPage,
    loadPage: setReviewsPage,
    boats: boatsQuery.data || [],
    loading,
    error,
    uploading: avatarMutation.isPending,
    initials,
    profileCompletion,
    missingProfileItems,
    handleAvatarChange,
    reload,
  }
}