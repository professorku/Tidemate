import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { queryKeys } from '../../../query/keys'
import {
  getMyProfile,
  getProfileUpdateError,
  mapProfileToForm,
  updateMyProfile,
} from '../services/editProfileService'

const INITIAL_FORM = {
  email: '',
  current_password: '',
  location: '',
  bio: '',
}

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

function getInitials(username) {
  const safeUsername = (username || 'TM').trim()
  return safeUsername.slice(0, 2).toUpperCase() || 'TM'
}

function calculateProfileCompletion(profile) {
  if (!profile) return 0

  let completed = 0
  if (profile.avatar) completed += 1
  if (profile.email) completed += 1
  if (profile.location) completed += 1
  if (profile.bio) completed += 1

  return Math.round((completed / 4) * 100)
}

export default function useEditProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, setUser } = useAuth()
  const formMethods = useForm({ defaultValues: INITIAL_FORM, mode: 'onBlur' })
  const watchedValues = useWatch({ control: formMethods.control }) || INITIAL_FORM

  const [initialProfile, setInitialProfile] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [localAvatarPreview, setLocalAvatarPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const profile = user || (await getMyProfile())
        setInitialProfile(profile)
        formMethods.reset(mapProfileToForm(profile))
        setError('')
      } catch {
        setError('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [formMethods, user])

  useEffect(() => {
    return () => {
      if (localAvatarPreview) {
        URL.revokeObjectURL(localAvatarPreview)
      }
    }
  }, [localAvatarPreview])

  const avatarPreview = localAvatarPreview || initialProfile?.avatar || null
  const selectedAvatarName = avatarFile?.name || ''

  const emailChanged = useMemo(() => {
    if (!initialProfile) return false
    return normalizeEmail(watchedValues.email) !== normalizeEmail(initialProfile.email)
  }, [initialProfile, watchedValues.email])

  const preview = useMemo(() => {
    const username = initialProfile?.username || user?.username || 'TideMate user'

    return {
      username,
      initials: getInitials(username),
      avatar: avatarPreview,
      email: watchedValues.email || initialProfile?.email || '',
      location: watchedValues.location || '',
      bio: watchedValues.bio || '',
    }
  }, [
    avatarPreview,
    initialProfile,
    user?.username,
    watchedValues.bio,
    watchedValues.email,
    watchedValues.location,
  ])

  const profileCompletion = useMemo(() => calculateProfileCompletion(preview), [preview])

  const clearLocalAvatar = () => {
    setAvatarFile(null)
    setLocalAvatarPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }
      return ''
    })
  }

  const handleAvatarSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextPreview = URL.createObjectURL(file)

    setAvatarFile(file)
    setLocalAvatarPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview)
      }
      return nextPreview
    })
    setError('')
    setSuccess('')

    event.target.value = ''
  }

  const handleClearAvatar = () => {
    clearLocalAvatar()
    setSuccess('')
  }

  const handleSubmit = formMethods.handleSubmit(async (values) => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const updatedProfile = await updateMyProfile({
        ...values,
        avatar_upload: avatarFile,
      })

      setUser(updatedProfile)
      queryClient.setQueryData(queryKeys.users.current, updatedProfile)
      setInitialProfile(updatedProfile)
      formMethods.reset(mapProfileToForm(updatedProfile))
      clearLocalAvatar()

      if (updatedProfile.email_change_pending) {
        setSuccess('Profile updated. Check your new email address to confirm the email change.')
      } else {
        setSuccess('Profile updated successfully.')
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
    loading,
    saving,
    error,
    success,
    preview,
    profileCompletion,
    emailChanged,
    pendingEmail: initialProfile?.pending_email || null,
    avatarPreview,
    selectedAvatarName,
    handleAvatarSelect,
    handleClearAvatar,
    handleSubmit,
    handleCancel,
  }
}