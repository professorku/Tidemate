import { useCallback, useEffect, useState } from 'react'
import { getMyListingDetail } from '../../../api/domains/listings'
import { getErrorMessage } from '../../../utils/errors'
import { mapBoatToForm } from '../utils/editBoatFormHelpers'

export function useEditBoatLoader({
  id,
  formMethods,
  resetImages,
  setError,
}) {
  const [boat, setBoat] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadBoat = useCallback(async () => {
    try {
      setLoading(true)

      const nextBoat = await getMyListingDetail(id)
      const images = Array.isArray(nextBoat.images) ? nextBoat.images : []

      setBoat(nextBoat)
      formMethods.reset(mapBoatToForm(nextBoat))
      resetImages(images)
      setError('')
    } catch (err) {
      setBoat(null)
      setError(getErrorMessage(err, 'Could not load this boat for editing.'))
    } finally {
      setLoading(false)
    }
  }, [formMethods, id, resetImages, setError])

  useEffect(() => {
    void loadBoat()
  }, [loadBoat])

  return {
    boat,
    loading,
    reload: loadBoat,
  }
}