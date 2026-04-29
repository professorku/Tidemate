import { Field, Input, Select, Textarea } from '../../../components/forms/Field'
import SectionShell from '../../../components/ui/SectionShell'
import { BOAT_TYPE_OPTIONS } from '../constants'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm text-red-600">{message}</p>
}

export default function AddBoatDetailsSection({ register, errors }) {
  return (
    <SectionShell as="div" variant="soft">
      <h2 className="text-2xl font-bold text-slate-900">Boat details</h2>

      <div className="mt-6 grid gap-5">
        <Field label="Title" htmlFor="add-boat-title">
          <Input
            id="add-boat-title"
            placeholder="Beautiful sailboat in Oslofjord"
            {...register('title', { required: 'Please add a title.' })}
          />
          <FieldError message={errors.title?.message} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Boat type" htmlFor="add-boat-type">
            <Select
              id="add-boat-type"
              {...register('boat_type', { required: 'Please choose a boat type.' })}
            >
              {BOAT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <FieldError message={errors.boat_type?.message} />
          </Field>

          <Field label="Guests" htmlFor="add-boat-guests">
            <Input
              id="add-boat-guests"
              type="number"
              min="1"
              placeholder="6"
              {...register('guests', {
                required: 'Please add the guest capacity.',
                min: { value: 1, message: 'Guests must be at least 1.' },
              })}
            />
            <FieldError message={errors.guests?.message} />
          </Field>
        </div>

        <Field label="Price per day" htmlFor="add-boat-price">
          <Input
            id="add-boat-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="2500"
            {...register('price_per_day', {
              required: 'Please add a daily price.',
              min: { value: 0, message: 'Price cannot be negative.' },
            })}
          />
          <FieldError message={errors.price_per_day?.message} />
        </Field>

        <Field label="Description" htmlFor="add-boat-description">
          <Textarea
            id="add-boat-description"
            rows="6"
            maxLength={2000}
            placeholder="Tell renters about the boat, the experience, equipment, and what makes it special..."
            {...register('description', {
              required: 'Please add a description.',
              minLength: { value: 20, message: 'Description should be at least 20 characters.' },
              maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters.' },
            })}
          />
          <FieldError message={errors.description?.message} />
        </Field>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-bold text-slate-900">Private pickup details</h3>
          <p className="mt-1 text-sm text-slate-600">
            These details are only shown to you, admins, and renters after their booking is confirmed.
            Public users only see the city/area from the map picker below.
          </p>

          <div className="mt-5 grid gap-5">
            <Field label="Exact pickup address" htmlFor="add-boat-pickup-address">
              <Input
                id="add-boat-pickup-address"
                maxLength={255}
                placeholder="Mo i Rana Marina, Dock B"
                {...register('pickup_address', {
                  required: 'Please add the private pickup address.',
                  maxLength: {
                    value: 255,
                    message: 'Pickup address cannot exceed 255 characters.',
                  },
                })}
              />
              <FieldError message={errors.pickup_address?.message} />
            </Field>

            <Field label="Pickup instructions" htmlFor="add-boat-pickup-instructions">
              <Textarea
                id="add-boat-pickup-instructions"
                rows="4"
                maxLength={1000}
                placeholder="Example: Meet beside the red service building. Call me 10 minutes before arrival."
                {...register('pickup_instructions', {
                  maxLength: {
                    value: 1000,
                    message: 'Pickup instructions cannot exceed 1000 characters.',
                  },
                })}
              />
              <FieldError message={errors.pickup_instructions?.message} />
            </Field>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}