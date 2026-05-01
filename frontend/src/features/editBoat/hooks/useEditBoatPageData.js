import { useEffect, useMemo, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getMyListingDetail, updateMyListing } from '../../../api/domains/listings'
import { getErrorMessage } from '../../../utils/errors'
import {
  createInitialForm,
  mapBoatToForm,
} from '../utils/editBoatFormHelpers'

function getInitialCoverSelection(images) {
  const coverImage = images.find((img) => img.is_cover) || images[0]

  if (!coverImage) {
    return null
  }

  return {
    type: 'existing',
    id: coverImage.id,
  }
}

export default function useEditBoatPageData() {
  const navigate = useNavigate()
  const { id } = useParams()
  const formMethods = useForm({ defaultValues: createInitialForm(), mode: 'onBlur' })

  const [boat, setBoat] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [newImages, setNewImages] = useState([])
  const [coverSelection, setCoverSelection] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const form = formMethods.watch()

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

  const loadBoat = useCallback(async () => {
    try {
      setLoading(true)
      const nextBoat = await getMyListingDetail(id)

      setBoat(nextBoat)
      formMethods.reset(mapBoatToForm(nextBoat))

      const images = Array.isArray(nextBoat.images) ? nextBoat.images : []
      setExistingImages(images)
      setRemovedImageIds([])
      setNewImages([])
      setCoverSelection(getInitialCoverSelection(images))
      setError('')
    } catch (err) {
      setBoat(null)
      setError(getErrorMessage(err, 'Could not load this boat for editing.'))
    } finally {
      setLoading(false)
    }
  }, [formMethods, id])

  useEffect(() => {
    void loadBoat()
  }, [loadBoat])

  const handleLocationChange = ({
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

    if (error) setError('')
  }

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setNewImages((prev) => {
      const next = [...prev, ...files]

      if (!coverSelection && existingImages.length === 0) {
        setCoverSelection({
          type: 'new',
          index: 0,
        })
      }

      return next
    })

    e.target.value = ''
    if (error) setError('')
  }

  const setExistingImageAsCover = (imageId) => {
    setCoverSelection({
      type: 'existing',
      id: imageId,
    })
  }

  const setNewImageAsCover = (index) => {
    setCoverSelection({
      type: 'new',
      index,
    })
  }

  const removeExistingImage = (imageId) => {
    const nextExisting = existingImages.filter((img) => img.id !== imageId)

    setExistingImages(nextExisting)
    setRemovedImageIds((prev) => {
      if (prev.includes(imageId)) return prev
      return [...prev, imageId]
    })

    setCoverSelection((prev) => {
      const removedImageWasCover = prev?.type === 'existing' && prev.id === imageId

      if (!removedImageWasCover) {
        return prev
      }

      if (nextExisting.length > 0) {
        return {
          type: 'existing',
          id: nextExisting[0].id,
        }
      }

      if (newImages.length > 0) {
        return {
          type: 'new',
          index: 0,
        }
      }

      return null
    })

    if (error) setError('')
  }

  const removeNewImage = (indexToRemove) => {
    const nextNewImages = newImages.filter((_, index) => index !== indexToRemove)

    setNewImages(nextNewImages)

    setCoverSelection((prev) => {
      if (prev?.type !== 'new') {
        return prev
      }

      if (prev.index === indexToRemove) {
        if (nextNewImages.length > 0) {
          return {
            type: 'new',
            index: Math.min(indexToRemove, nextNewImages.length - 1),
          }
        }

        if (existingImages.length > 0) {
          return {
            type: 'existing',
            id: existingImages[0].id,
          }
        }

        return null
      }

      if (indexToRemove < prev.index) {
        return {
          type: 'new',
          index: prev.index - 1,
        }
      }

      return prev
    })

    if (error) setError('')
  }

  const getValidCoverSelection = () => {
    if (
      coverSelection?.type === 'existing' &&
      existingImages.some((image) => image.id === coverSelection.id)
    ) {
      return coverSelection
    }

    if (
      coverSelection?.type === 'new' &&
      coverSelection.index >= 0 &&
      coverSelection.index < newImages.length
    ) {
      return coverSelection
    }

    if (existingImages.length > 0) {
      return {
        type: 'existing',
        id: existingImages[0].id,
      }
    }

    if (newImages.length > 0) {
      return {
        type: 'new',
        index: 0,
      }
    }

    return null
  }

  const handleSubmit = formMethods.handleSubmit(async (values) => {
    setError('')

    if (!values.latitude || !values.longitude) {
      setError('Please choose a location on the map.')
      return
    }

    if (!values.location_name?.trim()) {
      setError('Please add a public city or area for the listing.')
      return
    }

    if (!values.pickup_address?.trim()) {
      setError('Please choose the exact private pickup location on the map.')
      return
    }

    if (existingImages.length === 0 && newImages.length === 0) {
      setError('Please keep or upload at least one photo.')
      return
    }

    const validCoverSelection = getValidCoverSelection()

    if (!validCoverSelection) {
      setError('Please choose a cover photo.')
      return
    }

    setSaving(true)

    try {
      const data = new FormData()
      data.append('title', values.title)
      data.append('description', values.description)
      data.append('boat_type', values.boat_type)
      data.append('location_name', values.location_name)
      data.append('pickup_address', values.pickup_address || '')
      data.append('pickup_instructions', values.pickup_instructions || '')
      data.append('latitude', values.latitude)
      data.append('longitude', values.longitude)
      data.append('guests', values.guests)
      data.append('price_per_day', values.price_per_day)

      if (validCoverSelection.type === 'existing') {
        data.append('cover_image_id', String(validCoverSelection.id))
      }

      if (validCoverSelection.type === 'new') {
        data.append('cover_index', String(validCoverSelection.index))
      }

      removedImageIds.forEach((idValue) => {
        data.append('remove_image_ids', String(idValue))
      })

      newImages.forEach((file) => {
        data.append('new_images', file)
      })

      await updateMyListing(id, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      navigate('/my-boats')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update boat listing.'))
    } finally {
      setSaving(false)
    }
  })

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
    reload: loadBoat,
  }
}