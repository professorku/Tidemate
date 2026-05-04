export function validateEditBoatSubmission({
  values,
  existingImages,
  newImages,
  validCoverSelection,
}) {
  if (!values.latitude || !values.longitude) {
    return 'Please choose a location on the map.'
  }

  if (!values.location_name?.trim()) {
    return 'Please add a public city or area for the listing.'
  }

  if (!values.pickup_address?.trim()) {
    return 'Please choose the exact private pickup location on the map.'
  }

  if (existingImages.length === 0 && newImages.length === 0) {
    return 'Please keep or upload at least one photo.'
  }

  if (!validCoverSelection) {
    return 'Please choose a cover photo.'
  }

  return ''
}

export function buildBoatUpdateFormData({
  values,
  removedImageIds,
  newImages,
  validCoverSelection,
}) {
  const data = new FormData()

  data.append('title', values.title || '')
  data.append('description', values.description || '')
  data.append('boat_type', values.boat_type || '')
  data.append('location_name', values.location_name || '')
  data.append('pickup_address', values.pickup_address || '')
  data.append('pickup_instructions', values.pickup_instructions || '')
  data.append('latitude', values.latitude || '')
  data.append('longitude', values.longitude || '')
  data.append('guests', values.guests || '')
  data.append('price_per_day', values.price_per_day || '')

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

  return data
}