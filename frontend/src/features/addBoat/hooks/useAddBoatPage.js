import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { createListing } from '../../../api/domains/listings'
import { getErrorMessage } from '../../../utils/errors'
import { validateBoatImageFiles } from '../../../utils/imageUploadValidation'

const INITIAL_FORM = {
  title: '',
  description: '',
  boat_type: 'rib',
  location_name: '',
  pickup_address: '',
  pickup_instructions: '',
  latitude: '',
  longitude: '',
  guests: '',
  price_per_day: '',
}

export function useAddBoatPage() {
  const navigate = useNavigate()
  const formMethods = useForm({ defaultValues: INITIAL_FORM, mode: 'onBlur' })
  const values = formMethods.watch()

  const [images, setImages] = useState([])
  const [coverIndex, setCoverIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const previews = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  }, [images])

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [previews])

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

  const handleImagesChange = (event) => {
    const validation = validateBoatImageFiles(event.target.files, {
      currentCount: images.length,
    })

    event.target.value = ''

    if (!validation.valid) {
      setError(validation.error)
      return
    }

    if (!validation.files.length) return

    setImages((prev) => {
      const next = [...prev, ...validation.files]

      if (prev.length === 0) {
        setCoverIndex(0)
      }

      return next
    })

    if (error) setError('')
  }

  const removeImageAt = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove))

    setCoverIndex((prev) => {
      if (indexToRemove === prev) return 0
      if (indexToRemove < prev) return prev - 1
      return prev
    })
  }

  const handleSubmit = formMethods.handleSubmit(async (form) => {
    setError('')

    if (!form.latitude || !form.longitude) {
      setError('Please choose the exact boat location on the map.')
      return
    }

    if (!form.location_name?.trim()) {
      setError('Please choose a city or area for the public listing.')
      return
    }

    if (!form.pickup_address?.trim()) {
      setError('Please choose the exact private location on the map.')
      return
    }

    if (images.length === 0) {
      setError('Please upload at least one photo.')
      return
    }

    setLoading(true)

    try {
      const data = new FormData()
      data.append('title', form.title)
      data.append('description', form.description)
      data.append('boat_type', form.boat_type)
      data.append('location_name', form.location_name)
      data.append('pickup_address', form.pickup_address)
      data.append('pickup_instructions', form.pickup_instructions || '')
      data.append('latitude', form.latitude)
      data.append('longitude', form.longitude)
      data.append('guests', form.guests)
      data.append('price_per_day', form.price_per_day)
      data.append('cover_index', String(coverIndex))

      images.forEach((file) => {
        data.append('new_images', file)
      })

      await createListing(data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      navigate('/my-boats')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create boat listing.'))
    } finally {
      setLoading(false)
    }
  })

  return {
    formMethods,
    form: values,
    images,
    previews,
    coverIndex,
    loading,
    error,
    handleLocationChange,
    handleImagesChange,
    removeImageAt,
    setCoverIndex,
    handleSubmit,
  }
}