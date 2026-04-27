import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFavoritesPage, removeBoatFromFavoritesList } from '../../../api/domains/favorites'
import { getErrorMessage } from '../../../utils/errors'
import { queryKeys } from '../../../query/keys'

const EMPTY_PAGE = { count: 0, page: 1, totalPages: 1, boats: [] }

export default function useFavoritesPageData() {
  const [page, setPageState] = useState(1)
  const queryClient = useQueryClient()

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites.page(page),
    queryFn: () => getFavoritesPage({ page }),
  })

  const pagination = useMemo(
    () => ({
      count: favoritesQuery.data?.count ?? 0,
      page: favoritesQuery.data?.page ?? 1,
      totalPages: favoritesQuery.data?.totalPages ?? 1,
    }),
    [favoritesQuery.data]
  )

  const handleFavoriteChange = async (boatId, isFavorite) => {
    if (isFavorite) return

    queryClient.setQueryData(queryKeys.favorites.page(page), (current = EMPTY_PAGE) => {
      const boats = removeBoatFromFavoritesList(current.boats || [], boatId)
      return {
        ...current,
        count: Math.max(0, (current.count ?? boats.length) - 1),
        boats,
      }
    })

    const currentPage = queryClient.getQueryData(queryKeys.favorites.page(page))
    if ((currentPage?.boats?.length ?? 0) === 0 && page > 1) {
      setPageState(page - 1)
      return
    }

    await queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
  }

  const setPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return
    setPageState(nextPage)
  }

  return {
    boats: favoritesQuery.data?.boats || [],
    loading: favoritesQuery.isLoading,
    error: favoritesQuery.error ? getErrorMessage(favoritesQuery.error, 'Failed to load favorites.') : '',
    pagination,
    setPage,
    reload: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.page(page) }),
    handleFavoriteChange,
  }
}
