export function getInitialCoverSelection(images = []) {
  const coverImage = images.find((img) => img.is_cover) || images[0]

  if (!coverImage) {
    return null
  }

  return {
    type: 'existing',
    id: coverImage.id,
  }
}

export function getValidCoverSelection({
  coverSelection,
  existingImages,
  newImages,
}) {
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

export function getCoverAfterExistingImageRemoval({
  currentSelection,
  removedImageId,
  remainingExistingImages,
  newImages,
}) {
  const removedImageWasCover =
    currentSelection?.type === 'existing' && currentSelection.id === removedImageId

  if (!removedImageWasCover) {
    return currentSelection
  }

  if (remainingExistingImages.length > 0) {
    return {
      type: 'existing',
      id: remainingExistingImages[0].id,
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

export function getCoverAfterNewImageRemoval({
  currentSelection,
  removedIndex,
  remainingNewImages,
  existingImages,
}) {
  if (currentSelection?.type !== 'new') {
    return currentSelection
  }

  if (currentSelection.index === removedIndex) {
    if (remainingNewImages.length > 0) {
      return {
        type: 'new',
        index: Math.min(removedIndex, remainingNewImages.length - 1),
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

  if (removedIndex < currentSelection.index) {
    return {
      type: 'new',
      index: currentSelection.index - 1,
    }
  }

  return currentSelection
}