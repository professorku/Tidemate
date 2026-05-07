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
import { useWatch } from 'react-hook-form'

const DISPLAY_NAME_MAX_LENGTH = 80
const BIO_MAX_LENGTH = 300
const LOCATION_MAX_LENGTH = 60

const inputClassName =
  'w-full rounded-2xl border border-gold/25 bg-[#071d32]/80 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-gold focus:bg-[#071d32] focus:ring-2 focus:ring-gold/25 disabled:cursor-not-allowed disabled:opacity-60'

const labelClassName = 'mb-2 block text-sm font-semibold text-white/80'

function Field({ label, htmlFor, children, className = '' }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className={labelClassName}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm font-medium text-red-200">{message}</p>
}

function Alert({ type, children }) {
  if (!children) return null

  const styles =
    type === 'success'
      ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
      : 'border-red-300/25 bg-red-400/10 text-red-200'

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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-white/60">{description}</p>
        ) : null}
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
    formState: { errors },
  } = formMethods

  const bioValue =
    useWatch({
      control: formMethods.control,
      name: 'bio',
      defaultValue: '',
    }) || ''

  const locationValue =
    useWatch({
      control: formMethods.control,
      name: 'location',
      defaultValue: '',
    }) || ''

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

        <div className="flex flex-col gap-4 rounded-[24px] border border-gold/20 bg-[#071d32]/70 p-4 sm:flex-row sm:items-center">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile preview"
              className="h-24 w-24 rounded-full border-4 border-gold/25 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold/25 bg-navy text-gold shadow-sm">
              <UserIcon className="h-10 w-10" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy transition hover:bg-gold/90">
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
                  className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XMarkIcon className="h-4 w-4 text-gold" />
                  Remove selected
                </button>
              ) : null}
            </div>

            <p className="mt-2 truncate text-sm text-white/55">
              {selectedAvatarName || 'JPG, PNG, or WebP works best.'}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t border-gold/15 pt-8">
        <SectionTitle
          icon={<EnvelopeIcon className="h-5 w-5" />}
          title="Login email"
          description="Changing this requires your current password. Your old email stays active until the new one is verified."
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              autoComplete="email"
              disabled={saving}
              className={inputClassName}
              {...register('email', {
                required: 'Please add your email address.',
              })}
            />
            <FieldError message={errors.email?.message} />
          </Field>

          <Field label="Current password" htmlFor="currentPassword">
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              disabled={saving || !emailChanged}
              placeholder={
                emailChanged
                  ? 'Required to change email'
                  : 'Only needed if email changes'
              }
              className={inputClassName}
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
          <div className="flex gap-3 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
            <LockClosedIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-6 text-white/75">
              After saving, TideMate sends a verification link to the new email address
              before switching your account over.
            </p>
          </div>
        ) : null}
      </section>

      <section className="space-y-5 border-t border-gold/15 pt-8">
        <SectionTitle
          icon={<MapPinIcon className="h-5 w-5" />}
          title="Public profile"
          description="This is shown on your profile and helps people know who they are renting from or renting to."
        />

      <Field label="Display name" htmlFor="displayName">
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          disabled={saving}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          placeholder="Example: Jens Småby"
          className={inputClassName}
          {...register('display_name', {
            maxLength: {
              value: DISPLAY_NAME_MAX_LENGTH,
              message: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less.`,
            },
          })}
        />
        <p className="mt-2 text-xs text-white/50">
          This is the name other users will see. Your username is still used internally.
        </p>
        <FieldError message={errors.display_name?.message} />
      </Field>

        <Field label="Location" htmlFor="location">
          <input
            id="location"
            type="text"
            autoComplete="address-level2"
            disabled={saving}
            maxLength={LOCATION_MAX_LENGTH}
            placeholder="Example: Bodø, Norway"
            className={inputClassName}
            {...register('location', {
              maxLength: {
                value: LOCATION_MAX_LENGTH,
                message: `Location must be ${LOCATION_MAX_LENGTH} characters or less.`,
              },
            })}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/50">
            <span>Keep this broad. Do not add exact address details here.</span>
            <span>
              {locationValue.length}/{LOCATION_MAX_LENGTH}
            </span>
          </div>
          <FieldError message={errors.location?.message} />
        </Field>

        <Field label="Bio" htmlFor="bio">
          <textarea
            id="bio"
            rows="5"
            disabled={saving}
            maxLength={BIO_MAX_LENGTH}
            placeholder="Tell people a little about your boating experience, favorite waters, or what kind of renter/host you are."
            className={inputClassName}
            {...register('bio', {
              maxLength: {
                value: BIO_MAX_LENGTH,
                message: `Bio must be ${BIO_MAX_LENGTH} characters or less.`,
              },
            })}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/50">
            <span>A short, friendly bio makes your profile feel more trustworthy.</span>
            <span>
              {bioValue.length}/{BIO_MAX_LENGTH}
            </span>
          </div>
          <FieldError message={errors.bio?.message} />
        </Field>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-gold/15 pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border border-gold/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-gold px-6 py-3 text-sm font-extrabold text-navy shadow-sm transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving profile...' : 'Save profile'}
        </button>
      </div>
    </form>
  )
}