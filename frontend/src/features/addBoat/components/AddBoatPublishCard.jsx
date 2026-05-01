import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LifebuoyIcon,
  MapPinIcon,
  PhotoIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'

function formatPrice(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'Not set'

  return new Intl.NumberFormat('en-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(number)
}

function StatusRow({ complete, label, value, icon }) {
  return (
    <div className="rounded-2xl border border-gold/15 bg-[#071d32]/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
            complete
              ? 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/20'
              : 'bg-white/10 text-white/45 ring-white/10'
          }`}
        >
          {complete ? <CheckCircleIcon className="h-5 w-5" /> : icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gold">
            {label}
          </p>
          <p
            className={`mt-1 break-words text-sm font-semibold ${
              complete ? 'text-white' : 'text-white/55'
            }`}
          >
            {value || 'Not completed yet'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AddBoatPublishCard({
  form,
  images,
  coverIndex,
  error,
  loading,
}) {
  const hasDetails = Boolean(
    form.title?.trim() &&
      form.description?.trim() &&
      form.guests &&
      form.price_per_day
  )
  const hasExactPoint = Boolean(form.latitude && form.longitude)
  const hasPublicLocation = Boolean(form.location_name?.trim())
  const hasPrivateLocation = Boolean(form.pickup_address?.trim())
  const hasPhotos = images.length > 0
  const ready =
    hasDetails && hasExactPoint && hasPublicLocation && hasPrivateLocation && hasPhotos

  return (
    <div className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
          <RocketLaunchIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Publish
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">
            Ready to publish?
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Review the important details before creating your listing.
          </p>
        </div>
      </div>

      <div
        className={`mt-5 rounded-[22px] border px-4 py-3 text-sm ${
          ready
            ? 'border-emerald-300/25 bg-emerald-400/10 text-emerald-100'
            : 'border-gold/30 bg-gold/10 text-gold'
        }`}
      >
        <div className="flex items-start gap-2">
          {ready ? (
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="leading-6">
            {ready
              ? 'Everything needed for publishing is filled out.'
              : 'Complete details, location, and photos before publishing.'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <StatusRow
          complete={hasDetails}
          label="Boat details"
          value={
            hasDetails
              ? `${form.title} · ${form.guests} guest${Number(form.guests) === 1 ? '' : 's'} · ${formatPrice(form.price_per_day)} / day`
              : 'Title, description, guests, and price are required'
          }
          icon={<LifebuoyIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPublicLocation}
          label="Public area"
          value={form.location_name || 'Shown to renters before confirmation'}
          icon={<MapPinIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPrivateLocation && hasExactPoint}
          label="Private pickup point"
          value={
            hasPrivateLocation
              ? `${form.pickup_address}${hasExactPoint ? ` · ${form.latitude}, ${form.longitude}` : ''}`
              : 'Only confirmed renters can see this'
          }
          icon={<MapPinIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPhotos}
          label="Photos"
          value={
            hasPhotos
              ? `${images.length} selected · cover: ${images[coverIndex]?.name || 'not selected'}`
              : 'Upload at least one photo'
          }
          icon={<PhotoIcon className="h-5 w-5" />}
        />
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-extrabold text-navy shadow-sm transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RocketLaunchIcon className="h-5 w-5" />
        {loading ? 'Creating listing...' : 'Create listing'}
      </button>
    </div>
  )
}