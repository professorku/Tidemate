import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAddBoatPage } from './useAddBoatPage'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../../../api/domains/listings', () => ({
  createListing: vi.fn(),
}))

import { createListing } from '../../../api/domains/listings'

function submitEvent() {
  return {
    preventDefault: vi.fn(),
    persist: vi.fn(),
  }
}

function fillRequiredListingFields(result) {
  act(() => {
    result.current.formMethods.setValue('title', 'Oslofjord RIB')
    result.current.formMethods.setValue(
      'description',
      'A safe and comfortable RIB for coastal trips around Oslofjord.'
    )
    result.current.formMethods.setValue('boat_type', 'rib')
    result.current.formMethods.setValue('guests', '6')
    result.current.formMethods.setValue('price_per_day', '2500')

    result.current.handleLocationChange({
      latitude: '59.9111',
      longitude: '10.7528',
      location_name: 'Oslo',
      pickup_address: 'Aker Brygge marina',
    })
  })
}

function addTestImage(result, fileName = 'boat.jpg', type = 'image/jpeg') {
  const file = new File(['fake-image-content'], fileName, { type })

  act(() => {
    result.current.handleImagesChange({
      target: {
        files: [file],
        value: fileName,
      },
    })
  })

  return file
}

describe('useAddBoatPage image upload handling', () => {
  beforeEach(() => {
    navigateMock.mockReset()
    createListing.mockReset()
    createListing.mockResolvedValue({ id: 123 })

    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: vi.fn(() => 'blob:test-preview'),
    })

    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('shows an error when the host tries to publish without photos', async () => {
    const { result } = renderHook(() => useAddBoatPage())

    fillRequiredListingFields(result)

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Please upload at least one photo.')
    })

    expect(createListing).not.toHaveBeenCalled()
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('shows backend image validation errors from the listing API', async () => {
    createListing.mockRejectedValue({
      data: {
        new_images: ['Upload a valid image.'],
      },
    })

    const { result } = renderHook(() => useAddBoatPage())

    fillRequiredListingFields(result)
    addTestImage(result, 'not-really-an-image.txt', 'text/plain')

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Upload a valid image.')
    })

    expect(createListing).toHaveBeenCalledTimes(1)
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('submits multipart listing data and redirects to my boats on success', async () => {
    const { result } = renderHook(() => useAddBoatPage())

    fillRequiredListingFields(result)
    addTestImage(result)

    await act(async () => {
      await result.current.handleSubmit(submitEvent())
    })

    expect(createListing).toHaveBeenCalledWith(
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    )

    expect(navigateMock).toHaveBeenCalledWith('/my-boats')
  })
})