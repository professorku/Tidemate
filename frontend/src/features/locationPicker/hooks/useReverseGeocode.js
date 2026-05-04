import { useCallback, useState } from 'react'
import { reverseGeocodeLocation } from '../../../api/domains/geocoding'
import {
  getCityOrCounty,
  getExactAddress,
  roundCoordinate,
} from '../utils/locationPickerUtils'

async function reverseGeocodeCoordinates(latitude, longitude) {
  const roundedLatitude = roundCoordinate(latitude)
  const roundedLongitude = roundCoordinate(longitude)

  if (roundedLatitude === null || roundedLongitude === null) {
    throw new Error('Invalid coordinates.')
  }

  const data = await reverseGeocodeLocation({
    latitude: roundedLatitude,
    longitude: roundedLongitude,
  })

  const address = data.address || {}
  const displayName = data.display_name || ''

  return {
    location_name: data.location_name || getCityOrCounty(address, displayName),
    pickup_address:
      data.pickup_address ||
      getExactAddress(address, displayName, roundedLatitude, roundedLongitude),
  }
}

export function useReverseGeocode() {
  const [reverseLoading, setReverseLoading] = useState(false)

  const reverseGeocode = useCallback(async (latitude, longitude) => {
    setReverseLoading(true)

    try {
      return await reverseGeocodeCoordinates(latitude, longitude)
    } finally {
      setReverseLoading(false)
    }
  }, [])

  return {
    reverseLoading,
    reverseGeocode,
  }
}