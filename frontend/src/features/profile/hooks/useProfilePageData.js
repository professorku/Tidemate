import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { getListingsByHost } from '../../../api/domains/listings'
import { patchCurrentUser } from '../../../api/domains/users'
import { createEmptyReviewPage, getUserReviews } from '../../../api/domains/reviews'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

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

  const initials = useMemo(() => {
    const username = user?.username || 'TM'
    return username.slice(0, 2).toUpperCase()
  }, [user])

  const profileCompletion = useMemo(() => {
    if (!user) return 0

    let score = 0
    if (user.avatar) score += 1
    if (user.bio) score += 1
    if (user.location) score += 1
    if (user.email) score += 1

    return Math.round((score / 4) * 100)
  }, [user])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await avatarMutation.mutateAsync(file)
    } finally {
      e.target.value = ''
    }
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
    handleAvatarChange,
  }
}
