import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCoverAfterExistingImageRemoval,
  getCoverAfterNewImageRemoval,
  getInitialCoverSelection,
} from '../utils/editBoatImageHelpers'

export function useEditBoatImages({ clearError }) {
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [newImages, setNewImages] = useState([])
  const [coverSelection, setCoverSelection] = useState(null)

  const newPreviews = useMemo(() => {
    return newImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  }, [newImages])

  useEffect(() => {
    return () => {
      newPreviews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [newPreviews])

  const resetImages = useCallback((images = []) => {
    setExistingImages(images)
    setRemovedImageIds([])
    setNewImages([])
    setCoverSelection(getInitialCoverSelection(images))
  }, [])

  const handleNewImagesChange = useCallback(
    (event) => {
      const files = Array.from(event.target.files || [])

      if (!files.length) return

      setNewImages((currentImages) => {
        const nextImages = [...currentImages, ...files]

        if (!coverSelection && existingImages.length === 0) {
          setCoverSelection({
            type: 'new',
            index: 0,
          })
        }

        return nextImages
      })

      event.target.value = ''
      clearError()
    },
    [clearError, coverSelection, existingImages.length]
  )

  const setExistingImageAsCover = useCallback((imageId) => {
    setCoverSelection({
      type: 'existing',
      id: imageId,
    })
  }, [])

  const setNewImageAsCover = useCallback((index) => {
    setCoverSelection({
      type: 'new',
      index,
    })
  }, [])

  const removeExistingImage = useCallback(
    (imageId) => {
      setExistingImages((currentImages) => {
        const nextExistingImages = currentImages.filter((img) => img.id !== imageId)

        setRemovedImageIds((currentRemovedIds) => {
          if (currentRemovedIds.includes(imageId)) return currentRemovedIds
          return [...currentRemovedIds, imageId]
        })

        setCoverSelection((currentSelection) =>
          getCoverAfterExistingImageRemoval({
            currentSelection,
            removedImageId: imageId,
            remainingExistingImages: nextExistingImages,
            newImages,
          })
        )

        return nextExistingImages
      })

      clearError()
    },
    [clearError, newImages]
  )

  const removeNewImage = useCallback(
    (indexToRemove) => {
      setNewImages((currentImages) => {
        const nextNewImages = currentImages.filter(
          (_, index) => index !== indexToRemove
        )

        setCoverSelection((currentSelection) =>
          getCoverAfterNewImageRemoval({
            currentSelection,
            removedIndex: indexToRemove,
            remainingNewImages: nextNewImages,
            existingImages,
          })
        )

        return nextNewImages
      })

      clearError()
    },
    [clearError, existingImages]
  )

  return {
    existingImages,
    removedImageIds,
    newImages,
    newPreviews,
    coverSelection,
    resetImages,
    handleNewImagesChange,
    removeExistingImage,
    removeNewImage,
    setExistingImageAsCover,
    setNewImageAsCover,
  }
}