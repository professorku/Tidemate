import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import EditProfileForm from './EditProfileForm'

const defaultValues = {
  email: 'jens@example.com',
  current_password: '',
  location: 'Mo i Rana',
  bio: 'Boat enthusiast.',
}

function EditProfileFormHarness({
  emailChanged = false,
  onValidSubmit = vi.fn(),
  saving = false,
}) {
  const formMethods = useForm({
    defaultValues,
    mode: 'onBlur',
  })

  return (
    <EditProfileForm
      formMethods={formMethods}
      error=""
      success=""
      saving={saving}
      avatarPreview=""
      selectedAvatarName=""
      emailChanged={emailChanged}
      onAvatarSelect={vi.fn()}
      onClearAvatar={vi.fn()}
      onSubmit={formMethods.handleSubmit(onValidSubmit)}
      onCancel={vi.fn()}
    />
  )
}

describe('EditProfileForm', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('requires current password when the email is changed', async () => {
    const onValidSubmit = vi.fn()

    render(
      <EditProfileFormHarness
        emailChanged
        onValidSubmit={onValidSubmit}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /save profile/i }))

    expect(
      await screen.findByText('Current password is required when changing email.')
    ).not.toBeNull()

    expect(onValidSubmit).not.toHaveBeenCalled()
  })

  it('allows email-change submission when current password is provided', async () => {
    const onValidSubmit = vi.fn()

    render(
      <EditProfileFormHarness
        emailChanged
        onValidSubmit={onValidSubmit}
      />
    )

    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: {
        value: 'correct-password',
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /save profile/i }))

    await waitFor(() => {
      expect(onValidSubmit).toHaveBeenCalledTimes(1)
    })

    expect(onValidSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        email: 'jens@example.com',
        current_password: 'correct-password',
        location: 'Mo i Rana',
        bio: 'Boat enthusiast.',
      })
    )
  })

  it('disables the current password field when the email has not changed', () => {
    render(<EditProfileFormHarness emailChanged={false} />)

    expect(screen.getByLabelText(/current password/i).disabled).toBe(true)
  })
})