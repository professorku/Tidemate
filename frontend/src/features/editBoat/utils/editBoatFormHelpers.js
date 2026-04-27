export const BOAT_TYPE_OPTIONS = [
  { value: 'rib', label: 'RIB' },
  { value: 'sailboat', label: 'Sailboat' },
  { value: 'kayak', label: 'Kayak' },
  { value: 'yacht', label: 'Yacht' },
  { value: 'motorboat', label: 'Motorboat' },
  { value: 'other', label: 'Other' },
]

export const createInitialForm = () => ({
  title: '',
  description: '',
  boat_type: 'rib',
  location_name: '',
  latitude: '',
  longitude: '',
  guests: '',
  price_per_day: '',
})

export const mapBoatToForm = (boat) => ({
  title: boat.title || '',
  description: boat.description || '',
  boat_type: boat.boat_type || 'rib',
  location_name: boat.location_name || '',
  latitude: String(boat.latitude ?? ''),
  longitude: String(boat.longitude ?? ''),
  guests: String(boat.guests ?? ''),
  price_per_day: String(boat.price_per_day ?? ''),
})

export const getFirstBoatUpdateError = (data) => {
  return (
    data?.detail ||
    data?.title?.[0] ||
    data?.description?.[0] ||
    data?.boat_type?.[0] ||
    data?.location_name?.[0] ||
    data?.latitude?.[0] ||
    data?.longitude?.[0] ||
    data?.guests?.[0] ||
    data?.price_per_day?.[0] ||
    data?.new_images?.[0] ||
    data?.cover_image_id?.[0] ||
    data?.remove_image_ids?.[0] ||
    'Could not update boat listing.'
  )
}
