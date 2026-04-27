import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMyListing, listMyListingsPage } from '../../../api/domains/listings'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

const EMPTY_PAGINATION = { count: 0, page: 1, totalPages: 1 }

export default function useMyBoatsPageData() {
  const [page, setPageState] = useState(1)
  const queryClient = useQueryClient()

  const boatsQuery = useQuery({
    queryKey: queryKeys.listings.minePage(page),
    queryFn: () => listMyListingsPage({ page }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMyListing,
    onSuccess: async () => {
      const current = queryClient.getQueryData(queryKeys.listings.minePage(page))
      const nextPage = (current?.results?.length ?? 0) <= 1 && page > 1 ? page - 1 : page
      if (nextPage !== page) {
        setPageState(nextPage)
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.listings.mine })
    },
  })

  return {
    boats: boatsQuery.data?.results || [],
    loading: boatsQuery.isLoading,
    error: boatsQuery.error ? getErrorMessage(boatsQuery.error, 'Could not load your boats.') : '',
    deletingId: deleteMutation.isPending ? deleteMutation.variables : null,
    deleteBoat: (boatId) => deleteMutation.mutateAsync(boatId),
    pagination: boatsQuery.data
      ? {
          count: boatsQuery.data.count,
          page: boatsQuery.data.page,
          totalPages: boatsQuery.data.totalPages,
        }
      : EMPTY_PAGINATION,
    setPage: (nextPage) => {
      const totalPages = boatsQuery.data?.totalPages ?? 1
      if (nextPage < 1 || nextPage > totalPages) return
      setPageState(nextPage)
    },
    reload: () => queryClient.invalidateQueries({ queryKey: queryKeys.listings.minePage(page) }),
  }
}
