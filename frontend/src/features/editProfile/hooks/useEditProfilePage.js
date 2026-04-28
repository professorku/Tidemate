import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/useAuth'
import {
  getMyProfile,
  getProfileUpdateError,
  mapProfileToForm,
  updateMyProfile,
} from '../services/editProfileService'

const INITIAL_FORM = {
  email: '',
  location: '',
  bio: '',
}

export default function useEditProfilePage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const formMethods = useForm({ defaultValues: INITIAL_FORM, mode: 'onBlur' })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const profile = user || (await getMyProfile())
        formMethods.reset(mapProfileToForm(profile))
        setError('')
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [formMethods, user])

  const handleSubmit = formMethods.handleSubmit(async (values) => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updatedProfile = await updateMyProfile(values)
      setUser(updatedProfile)

    if (updatedProfile.email_change_pending) {
      setSuccess('Profile updated. Check your new email address to confirm the email change.')
    } else {
      setSuccess('Profile updated successfully')
      navigate('/profile')
    }
    } catch (err) {
      setError(getProfileUpdateError(err))
    } finally {
      setSaving(false)
    }
  })

  const handleCancel = () => {
    navigate('/profile')
  }

  return {
    formMethods,
    form: formMethods.watch(),
    loading,
    saving,
    error,
    success,
    handleSubmit,
    handleCancel,
  }
}
