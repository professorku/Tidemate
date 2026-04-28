import { Field, Input, Textarea } from '../../../components/forms/Field'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm text-red-600">{message}</p>
}

export default function EditProfileForm({
  formMethods,
  error,
  success,
  saving,
  onSubmit,
  onCancel,
}) {
  const { register, formState: { errors } } = formMethods

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? <div className="mb-4 text-red-600">{error}</div> : null}
      {success ? <div className="mb-4 text-green-600">{success}</div> : null}

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email', {
            required: 'Please add your email address.',
          })}
        />
        <FieldError message={errors.email?.message} />
      </Field>

      <Field label="Current password" htmlFor="currentPassword">
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Required only when changing email"
          {...register('current_password')}
        />
        <p className="mt-2 text-sm text-slate-500">
          Required only if you change your email address.
        </p>
        <FieldError message={errors.current_password?.message} />
      </Field>

      <Field label="Location" htmlFor="location">
        <Input
          id="location"
          type="text"
          autoComplete="address-level2"
          {...register('location')}
        />
        <FieldError message={errors.location?.message} />
      </Field>

      <Field label="Bio" htmlFor="bio">
        <Textarea
          id="bio"
          rows="5"
          {...register('bio', {
            maxLength: {
              value: 500,
              message: 'Bio must be 500 characters or less.',
            },
          })}
        />
        <FieldError message={errors.bio?.message} />
      </Field>

      <div className="flex gap-4">
        <button type="button" onClick={onCancel} className="rounded-full border px-6 py-2">
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gold px-6 py-2 font-semibold text-navy"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}