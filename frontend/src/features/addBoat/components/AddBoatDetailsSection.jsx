import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  LifebuoyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { BOAT_TYPE_OPTIONS } from '../constants'

const TITLE_MAX_LENGTH = 120
const DESCRIPTION_MAX_LENGTH = 2000

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

function HelperText({ children }) {
  return <p className="mt-2 text-xs leading-5 text-white/55">{children}</p>
}

function SectionTitle() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
        <LifebuoyIcon className="h-6 w-6" />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
          Listing basics
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-white">
          Boat details
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
          These details are visible to renters and help them decide if the boat fits
          their trip.
        </p>
      </div>
    </div>
  )
}

export default function AddBoatDetailsSection({
  register,
  errors,
  form,
  disabled = false,
}) {
  const titleLength = form?.title?.length || 0
  const descriptionLength = form?.description?.length || 0

  return (
    <section className="rounded-[28px] border border-gold/20 bg-navy p-6 shadow-soft md:p-8">
      <SectionTitle />

      <div className="mt-7 grid gap-5">
        <Field label="Title" htmlFor="add-boat-title">
          <input
            id="add-boat-title"
            disabled={disabled}
            maxLength={TITLE_MAX_LENGTH}
            className={inputClassName}
            placeholder="Beautiful sailboat in Oslofjord"
            {...register('title', {
              required: 'Please add a title.',
              maxLength: {
                value: TITLE_MAX_LENGTH,
                message: `Title must be ${TITLE_MAX_LENGTH} characters or less.`,
              },
            })}
          />
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/55">
            <span>Use a clear, specific title renters can understand quickly.</span>
            <span>{titleLength}/{TITLE_MAX_LENGTH}</span>
          </div>
          <FieldError message={errors.title?.message} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Boat type" htmlFor="add-boat-type">
            <select
              id="add-boat-type"
              disabled={disabled}
              className={inputClassName}
              {...register('boat_type', {
                required: 'Please choose a boat type.',
              })}
            >
              {BOAT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <HelperText>
              Choose the category that best describes the boat.
            </HelperText>
            <FieldError message={errors.boat_type?.message} />
          </Field>

          <Field label="Guest capacity" htmlFor="add-boat-guests">
            <div className="relative">
              <input
                id="add-boat-guests"
                type="number"
                min="1"
                disabled={disabled}
                placeholder="6"
                className={`${inputClassName} pr-12`}
                {...register('guests', {
                  required: 'Please add the guest capacity.',
                  min: { value: 1, message: 'Guests must be at least 1.' },
                })}
              />
              <UserGroupIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold/70" />
            </div>
            <HelperText>Maximum number of people allowed on the boat.</HelperText>
            <FieldError message={errors.guests?.message} />
          </Field>
        </div>

        <Field label="Price per day" htmlFor="add-boat-price">
          <div className="relative">
            <input
              id="add-boat-price"
              type="number"
              min="0"
              step="0.01"
              disabled={disabled}
              placeholder="2500"
              className={`${inputClassName} pr-12`}
              {...register('price_per_day', {
                required: 'Please add a daily price.',
                min: { value: 0, message: 'Price cannot be negative.' },
              })}
            />
            <CurrencyDollarIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold/70" />
          </div>
          <HelperText>
            Renters will see this as the base daily price before choosing dates.
          </HelperText>
          <FieldError message={errors.price_per_day?.message} />
        </Field>

        <Field label="Description" htmlFor="add-boat-description">
          <div className="relative">
            <textarea
              id="add-boat-description"
              rows="7"
              maxLength={DESCRIPTION_MAX_LENGTH}
              disabled={disabled}
              className={inputClassName}
              placeholder="Tell renters about the boat, equipment, safety gear, pickup experience, and what makes it special..."
              {...register('description', {
                required: 'Please add a description.',
                minLength: {
                  value: 20,
                  message: 'Description should be at least 20 characters.',
                },
                maxLength: {
                  value: DESCRIPTION_MAX_LENGTH,
                  message: `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters.`,
                },
              })}
            />
            <DocumentTextIcon className="pointer-events-none absolute right-4 top-4 h-5 w-5 text-gold/60" />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/55">
            <span>Mention equipment, rules, fuel expectations, and trip ideas.</span>
            <span>{descriptionLength}/{DESCRIPTION_MAX_LENGTH}</span>
          </div>
          <FieldError message={errors.description?.message} />
        </Field>
      </div>
    </section>
  )
}