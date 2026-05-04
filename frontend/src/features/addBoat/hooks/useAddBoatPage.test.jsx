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

function createTestImage(fileName = 'boat.jpg', type = 'image/jpeg', size = 100) {
  return new File(['x'.repeat(size)], fileName, { type })
}

function addTestImages(result, files) {
  act(() => {
    result.current.handleImagesChange({
      target: {
        files,
        value: files[0]?.name || '',
      },
    })
  })
}

function addTestImage(result, fileName = 'boat.jpg', type = 'image/jpeg', size = 100) {
  const file = createTestImage(fileName, type, size)
  addTestImages(result, [file])
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

  it('rejects non-image files before calling the listing API', () => {
    const { result } = renderHook(() => useAddBoatPage())

    addTestImage(result, 'not-really-an-image.txt', 'text/plain')

    expect(result.current.error).toBe(
      'not-really-an-image.txt must be a JPG, PNG, WEBP, or GIF image.'
    )
    expect(result.current.images).toHaveLength(0)
    expect(createListing).not.toHaveBeenCalled()
  })

  it('rejects images larger than 5 MB before calling the listing API', () => {
    const { result } = renderHook(() => useAddBoatPage())
    const sixMegabytes = 6 * 1024 * 1024

    addTestImage(result, 'huge-boat.jpg', 'image/jpeg', sixMegabytes)

    expect(result.current.error).toBe(
      'huge-boat.jpg is too large. Maximum file size is 5.0 MB.'
    )
    expect(result.current.images).toHaveLength(0)
    expect(createListing).not.toHaveBeenCalled()
  })

  it('rejects more than 10 total images before calling the listing API', () => {
    const { result } = renderHook(() => useAddBoatPage())

    const files = Array.from({ length: 11 }, (_, index) =>
      createTestImage(`boat-${index + 1}.jpg`)
    )

    addTestImages(result, files)

    expect(result.current.error).toBe(
      'A boat listing can have at most 10 images. You can add 10 more photos.'
    )
    expect(result.current.images).toHaveLength(0)
    expect(createListing).not.toHaveBeenCalled()
  })

  it('shows backend image validation errors from the listing API', async () => {
    createListing.mockRejectedValue({
      data: {
        new_images: ['Upload a valid image.'],
      },
    })

    const { result } = renderHook(() => useAddBoatPage())

    fillRequiredListingFields(result)
    addTestImage(result, 'boat.jpg', 'image/jpeg')

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