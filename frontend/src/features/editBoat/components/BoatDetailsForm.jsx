import { Field, Input, Select, Textarea } from '../../../components/forms/Field'
import SectionShell from '../../../components/ui/SectionShell'
import { BOAT_TYPE_OPTIONS } from '../utils/editBoatFormHelpers'

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-2 text-sm text-red-600">{message}</p>
}

export default function BoatDetailsForm({ register, errors }) {
  return (
    <SectionShell as="div" variant="soft">
      <h2 className="text-2xl font-bold text-slate-900">Boat details</h2>

      <div className="mt-6 grid gap-5">
        <Field label="Title" htmlFor="edit-boat-title">
          <Input
            id="edit-boat-title"
            {...register('title', { required: 'Please add a title.' })}
          />
          <FieldError message={errors.title?.message} />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Boat type" htmlFor="edit-boat-type">
            <Select
              id="edit-boat-type"
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

          <Field label="Guests" htmlFor="edit-boat-guests">
            <Input
              id="edit-boat-guests"
              type="number"
              min="1"
              {...register('guests', {
                required: 'Please add the guest capacity.',
                min: { value: 1, message: 'Guests must be at least 1.' },
              })}
            />
            <FieldError message={errors.guests?.message} />
          </Field>
        </div>

        <Field label="Price per day" htmlFor="edit-boat-price">
          <Input
            id="edit-boat-price"
            type="number"
            min="0"
            step="0.01"
            {...register('price_per_day', {
              required: 'Please add a daily price.',
              min: { value: 0, message: 'Price cannot be negative.' },
            })}
          />
          <FieldError message={errors.price_per_day?.message} />
        </Field>

        <Field label="Description" htmlFor="edit-boat-description">
          <Textarea
            id="edit-boat-description"
            rows="6"
            maxLength={2000}
            {...register('description', {
              required: 'Please add a description.',
              minLength: { value: 20, message: 'Description should be at least 20 characters.' },
              maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters.' },
            })}
          />
          <FieldError message={errors.description?.message} />
        </Field>
      </div>
    </SectionShell>
  )
}
