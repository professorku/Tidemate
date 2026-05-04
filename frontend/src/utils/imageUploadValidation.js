export const MAX_BOAT_IMAGE_COUNT = 10
export const MAX_BOAT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export const ALLOWED_BOAT_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_BOAT_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
])

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '0 MB'

  const megabytes = bytes / (1024 * 1024)

  if (megabytes >= 1) {
    return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`
  }

  const kilobytes = bytes / 1024
  return `${Math.max(1, Math.round(kilobytes))} KB`
}

function getFileExtension(fileName = '') {
  const dotIndex = fileName.lastIndexOf('.')

  if (dotIndex === -1) return ''

  return fileName.slice(dotIndex).toLowerCase()
}

function hasAllowedImageType(file) {
  const mimeType = (file.type || '').toLowerCase()

  if (mimeType) {
    return ALLOWED_BOAT_IMAGE_MIME_TYPES.has(mimeType)
  }

  // Some browsers/devices may provide an empty MIME type.
  // Only fall back to extension when MIME type is missing, not when it is wrong.
  return ALLOWED_BOAT_IMAGE_EXTENSIONS.has(getFileExtension(file.name))
}

export function validateBoatImageFiles(files, { currentCount = 0 } = {}) {
  const selectedFiles = Array.from(files || [])

  if (selectedFiles.length === 0) {
    return {
      valid: true,
      files: [],
      error: '',
    }
  }

  const totalCount = currentCount + selectedFiles.length

  if (totalCount > MAX_BOAT_IMAGE_COUNT) {
    const remainingSlots = Math.max(MAX_BOAT_IMAGE_COUNT - currentCount, 0)

    return {
      valid: false,
      files: [],
      error:
        remainingSlots === 0
          ? `A boat listing can have at most ${MAX_BOAT_IMAGE_COUNT} images. Remove a photo before uploading another one.`
          : `A boat listing can have at most ${MAX_BOAT_IMAGE_COUNT} images. You can add ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'}.`,
    }
  }

  const wrongTypeFile = selectedFiles.find((file) => !hasAllowedImageType(file))

  if (wrongTypeFile) {
    return {
      valid: false,
      files: [],
      error: `${wrongTypeFile.name || 'Selected file'} must be a JPG, PNG, WEBP, or GIF image.`,
    }
  }

  const oversizedFile = selectedFiles.find(
    (file) => file.size > MAX_BOAT_IMAGE_SIZE_BYTES
  )

  if (oversizedFile) {
    return {
      valid: false,
      files: [],
      error: `${oversizedFile.name || 'Selected image'} is too large. Maximum file size is ${formatFileSize(MAX_BOAT_IMAGE_SIZE_BYTES)}.`,
    }
  }

  return {
    valid: true,
    files: selectedFiles,
    error: '',
  }
}