import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateMyListing } from '../../../api/domains/listings'
import { getErrorMessage } from '../../../utils/errors'
import { getValidCoverSelection } from '../utils/editBoatImageHelpers'
import {
  buildBoatUpdateFormData,
  validateEditBoatSubmission,
} from '../utils/editBoatSubmitHelpers'

export function useEditBoatSubmit({
  id,
  formMethods,
  existingImages,
  removedImageIds,
  newImages,
  coverSelection,
  setError,
}) {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const handleSubmit = formMethods.handleSubmit(async (values) => {
    setError('')

    const validCoverSelection = getValidCoverSelection({
      coverSelection,
      existingImages,
      newImages,
    })

    const validationError = validateEditBoatSubmission({
      values,
      existingImages,
      newImages,
      validCoverSelection,
    })

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const data = buildBoatUpdateFormData({
        values,
        removedImageIds,
        newImages,
        validCoverSelection,
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
    saving,
    handleSubmit,
  }
}