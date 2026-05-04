import { useCallback, useEffect, useMemo, useState } from 'react'
import { validateBoatImageFiles } from '../../../utils/imageUploadValidation'
import {
  getCoverAfterExistingImageRemoval,
  getCoverAfterNewImageRemoval,
  getInitialCoverSelection,
} from '../utils/editBoatImageHelpers'

export function useEditBoatImages({ clearError, setError }) {
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
      const selectedFiles = event.target.files

      const validation = validateBoatImageFiles(selectedFiles, {
        currentCount: existingImages.length + newImages.length,
      })

      event.target.value = ''

      if (!validation.valid) {
        setError(validation.error)
        return
      }

      if (!validation.files.length) return

      setNewImages((currentImages) => {
        const nextImages = [...currentImages, ...validation.files]

        if (!coverSelection && existingImages.length === 0) {
          setCoverSelection({
            type: 'new',
            index: 0,
          })
        }

        return nextImages
      })

      clearError()
    },
    [
      clearError,
      coverSelection,
      existingImages.length,
      newImages.length,
      setError,
    ]
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
    setExistingImages,
    setRemovedImageIds,
    setNewImages,
    setCoverSelection,
    resetImages,
    handleNewImagesChange,
    removeExistingImage,
    removeNewImage,
    setExistingImageAsCover,
    setNewImageAsCover,
  }
}