import { useCallback, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { createInitialForm } from '../utils/editBoatFormHelpers'
import { useEditBoatImages } from './useEditBoatImages'
import { useEditBoatLoader } from './useEditBoatLoader'
import { useEditBoatSubmit } from './useEditBoatSubmit'

export default function useEditBoatPageData() {
  const { id } = useParams()

  const formMethods = useForm({
    defaultValues: createInitialForm(),
    mode: 'onBlur',
  })

  const [error, setError] = useState('')

  const clearError = useCallback(() => {
    setError((currentError) => (currentError ? '' : currentError))
  }, [])

  const {
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
  } = useEditBoatImages({ clearError, setError })

  const { boat, loading, reload } = useEditBoatLoader({
    id,
    formMethods,
    resetImages,
    setError,
  })

  const { saving, handleSubmit } = useEditBoatSubmit({
    id,
    formMethods,
    existingImages,
    removedImageIds,
    newImages,
    coverSelection,
    setError,
  })

  const form = useWatch({
    control: formMethods.control,
    defaultValue: createInitialForm(),
  })

  const handleLocationChange = useCallback(
    ({
      latitude,
      longitude,
      location_name,
      pickup_address,
    }) => {
      formMethods.setValue('latitude', latitude, { shouldDirty: true })
      formMethods.setValue('longitude', longitude, { shouldDirty: true })

      formMethods.setValue('location_name', location_name || '', {
        shouldDirty: true,
      })

      formMethods.setValue('pickup_address', pickup_address || '', {
        shouldDirty: true,
      })

      clearError()
    },
    [clearError, formMethods]
  )

  return {
    boat,
    formMethods,
    form,
    existingImages,
    newImages,
    newPreviews,
    removedImageIds,
    coverSelection,
    loading,
    saving,
    error,
    handleLocationChange,
    handleNewImagesChange,
    removeExistingImage,
    removeNewImage,
    setExistingImageAsCover,
    setNewImageAsCover,
    handleSubmit,
    reload,
  }
}