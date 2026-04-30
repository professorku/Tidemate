import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  MapPinIcon,
  PhotoIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Field, Input, Textarea } from '../../../components/forms/Field'

const BIO_MAX_LENGTH = 1000
const LOCATION_MAX_LENGTH = 120

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm font-medium text-red-600">{message}</p>
}

function Alert({ type, children }) {
  if (!children) return null

  const styles =
    type === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-red-200 bg-red-50 text-red-700'

  const Icon = type === 'success' ? CheckCircleIcon : ExclamationTriangleIcon

  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${styles}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="leading-6">{children}</p>
    </div>
  )
}

function SectionTitle({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
    </div>
  )
}

export default function EditProfileForm({
  formMethods,
  error,
  success,
  saving,
  avatarPreview,
  selectedAvatarName,
  emailChanged,
  onAvatarSelect,
  onClearAvatar,
  onSubmit,
  onCancel,
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = formMethods

  const bioValue = watch('bio') || ''
  const locationValue = watch('location') || ''

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-3">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      <section className="space-y-5">
        <SectionTitle
          icon={<PhotoIcon className="h-5 w-5" />}
          title="Profile photo"
          description="Add a clear photo so renters and hosts recognize your account."
        />

        <div className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile preview"
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-navy text-white shadow-sm">
              <UserIcon className="h-10 w-10" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-ocean">
                <ArrowUpTrayIcon className="h-4 w-4" />
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarSelect}
                  disabled={saving}
                  className="hidden"
                />
              </label>

              {selectedAvatarName ? (
                <button
                  type="button"
                  onClick={onClearAvatar}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Remove selected
                </button>
              ) : null}
            </div>

            <p className="mt-2 truncate text-sm text-slate-500">
              {selectedAvatarName || 'JPG, PNG, or WebP works best.'}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-8">
        <SectionTitle
          icon={<EnvelopeIcon className="h-5 w-5" />}
          title="Login email"
          description="Changing this requires your current password. Your old email stays active until the new one is verified."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              disabled={saving}
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
              disabled={saving || !emailChanged}
              placeholder={emailChanged ? 'Required to change email' : 'Only needed if email changes'}
              {...register('current_password', {
                validate: (value) => {
                  if (emailChanged && !value) {
                    return 'Current password is required when changing email.'
                  }
                  return true
                },
              })}
            />
            <FieldError message={errors.current_password?.message} />
          </Field>
        </div>

        {emailChanged ? (
          <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <LockClosedIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-6">
              After saving, TideMate sends a verification link to the new email address before switching your account over.
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-5 border-t border-slate-200 pt-8">
        <SectionTitle
          icon={<MapPinIcon className="h-5 w-5" />}
          title="Public profile"
          description="This is shown on your profile and helps people know who they are renting from or renting to."
        />

        <Field label="Location" htmlFor="location">
          <Input
            id="location"
            type="text"
            autoComplete="address-level2"
            disabled={saving}
            placeholder="Example: Bodø, Norway"
            {...register('location', {
              maxLength: {
                value: LOCATION_MAX_LENGTH,
                message: `Location must be ${LOCATION_MAX_LENGTH} characters or less.`,
              },
            })}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>Keep this broad. Do not add exact address details here.</span>
            <span>{locationValue.length}/{LOCATION_MAX_LENGTH}</span>
          </div>
          <FieldError message={errors.location?.message} />
        </Field>

        <Field label="Bio" htmlFor="bio">
          <Textarea
            id="bio"
            rows="7"
            disabled={saving}
            placeholder="Tell people a little about your boating experience, favorite waters, or what kind of renter/host you are."
            {...register('bio', {
              maxLength: {
                value: BIO_MAX_LENGTH,
                message: `Bio must be ${BIO_MAX_LENGTH} characters or less.`,
              },
            })}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>A friendly bio makes your profile feel more trustworthy.</span>
            <span>{bioValue.length}/{BIO_MAX_LENGTH}</span>
          </div>
          <FieldError message={errors.bio?.message} />
        </Field>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving profile...' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}