import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMyListing, listMyListingsPage } from '../../../api/domains/listings'
import {
  getHostBookingCounts,
  getHostBookingsPage,
} from '../../../api/domains/bookings'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

const EMPTY_PAGINATION = { count: 0, page: 1, totalPages: 1 }
const EMPTY_STATS = { all: 0, pending: 0, confirmed: 0, cancelled: 0 }
const PENDING_PREVIEW_QUERY_KEY = ['bookings', 'host', 'dashboard', 'pending-preview']

export default function useMyBoatsPageData() {
  const [page, setPageState] = useState(1)
  const queryClient = useQueryClient()

  const boatsQuery = useQuery({
    queryKey: queryKeys.listings.minePage(page),
    queryFn: () => listMyListingsPage({ page }),
  })

  const statsQuery = useQuery({
    queryKey: queryKeys.bookings.hostCounts,
    queryFn: getHostBookingCounts,
  })

  const pendingRequestsQuery = useQuery({
    queryKey: PENDING_PREVIEW_QUERY_KEY,
    queryFn: () => getHostBookingsPage('pending', 1, 3),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMyListing,
    onSuccess: async () => {
      const current = queryClient.getQueryData(queryKeys.listings.minePage(page))
      const nextPage = (current?.results?.length ?? 0) <= 1 && page > 1 ? page - 1 : page

      if (nextPage !== page) {
        setPageState(nextPage)
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.listings.mine }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.hostCounts }),
        queryClient.invalidateQueries({ queryKey: PENDING_PREVIEW_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
      ])
    },
  })

  const pagination = boatsQuery.data
    ? {
        count: boatsQuery.data.count,
        page: boatsQuery.data.page,
        totalPages: boatsQuery.data.totalPages,
      }
    : EMPTY_PAGINATION

  const reload = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.minePage(page) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.hostCounts }),
      queryClient.invalidateQueries({ queryKey: PENDING_PREVIEW_QUERY_KEY }),
    ])
  }

  const refreshHostActivity = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.hostCounts }),
      queryClient.invalidateQueries({ queryKey: PENDING_PREVIEW_QUERY_KEY }),
    ])
  }

  return {
    boats: boatsQuery.data?.results || [],
    loading: boatsQuery.isLoading,
    error: boatsQuery.error
      ? getErrorMessage(boatsQuery.error, 'Could not load your boats.')
      : '',
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    deleteBoat: (boatId) => deleteMutation.mutateAsync(boatId),
    pagination,
    setPage: (nextPage) => {
      const totalPages = boatsQuery.data?.totalPages ?? 1
      if (nextPage < 1 || nextPage > totalPages) return
      setPageState(nextPage)
    },
    reload,

    stats: statsQuery.data || EMPTY_STATS,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error
      ? getErrorMessage(statsQuery.error, 'Could not load booking stats.')
      : '',

    pendingRequests: pendingRequestsQuery.data?.results || [],
    pendingRequestsLoading: pendingRequestsQuery.isLoading,
    pendingRequestsError: pendingRequestsQuery.error
      ? getErrorMessage(pendingRequestsQuery.error, 'Could not load pending requests.')
      : '',
    refreshHostActivity,
  }
}