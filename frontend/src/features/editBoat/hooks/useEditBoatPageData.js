import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { getMyListingDetail, updateMyListing } from '../../../api/domains/listings'
import { getErrorMessage } from '../../../utils/errors'
import {
  createInitialForm,
  mapBoatToForm,
} from '../utils/editBoatFormHelpers'

export default function useEditBoatPageData() {
  const navigate = useNavigate()
  const { id } = useParams()
  const formMethods = useForm({ defaultValues: createInitialForm(), mode: 'onBlur' })

  const [existingImages, setExistingImages] = useState([])
  const [removedImageIds, setRemovedImageIds] = useState([])
  const [newImages, setNewImages] = useState([])
  const [coverImageId, setCoverImageId] = useState(null)

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

  useEffect(() => {
    const loadBoat = async () => {
      try {
        setLoading(true)
        const boat = await getMyListingDetail(id)

        formMethods.reset(mapBoatToForm(boat))

        const images = Array.isArray(boat.images) ? boat.images : []
        setExistingImages(images)
        setCoverImageId(images.find((img) => img.is_cover)?.id || images[0]?.id || null)
        setError('')
      } catch (err) {
        setError(getErrorMessage(err, 'Could not load this boat for editing.'))
      } finally {
        setLoading(false)
      }
    }

    loadBoat()
  }, [formMethods, id])

  const handleLocationChange = ({ latitude, longitude, location_name }) => {
    formMethods.setValue('latitude', latitude, { shouldDirty: true })
    formMethods.setValue('longitude', longitude, { shouldDirty: true })
    formMethods.setValue('location_name', location_name, { shouldDirty: true })
    if (error) setError('')
  }

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setNewImages((prev) => [...prev, ...files])
    e.target.value = ''
  }

  const removeExistingImage = (imageId) => {
    const nextExisting = existingImages.filter((img) => img.id !== imageId)
    setExistingImages(nextExisting)
    setRemovedImageIds((prev) => [...prev, imageId])

    if (coverImageId === imageId) {
      setCoverImageId(nextExisting[0]?.id || null)
    }
  }

  const removeNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = formMethods.handleSubmit(async (values) => {
    setError('')

    if (!values.latitude || !values.longitude) {
      setError('Please choose a location on the map.')
      return
    }

    if (existingImages.length === 0 && newImages.length === 0) {
      setError('Please keep or upload at least one photo.')
      return
    }

    setSaving(true)

    try {
      const data = new FormData()
      data.append('title', values.title)
      data.append('description', values.description)
      data.append('boat_type', values.boat_type)
      data.append('location_name', values.location_name)
      data.append('latitude', values.latitude)
      data.append('longitude', values.longitude)
      data.append('guests', values.guests)
      data.append('price_per_day', values.price_per_day)

      if (coverImageId) {
        data.append('cover_image_id', String(coverImageId))
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
    formMethods,
    form,
    existingImages,
    newImages,
    newPreviews,
    removedImageIds,
    coverImageId,
    loading,
    saving,
    error,
    handleLocationChange,
    handleNewImagesChange,
    removeExistingImage,
    removeNewImage,
    setCoverImageId,
    handleSubmit,
  }
}
