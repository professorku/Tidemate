import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhotoIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'


const MIN_PICKUP_LENGTH = 8

const FINGERPRINT_LENGTH = 8

const PUBLIC_FIELD_LABELS = {
  title: 'title',
  description: 'description',
  location_name: 'public area',
}

function detectPickupLeakage({ title, description, locationName, pickupAddress, latitude, longitude }) {
  const leakedFields = []

  const pickup = String(pickupAddress || '').trim()
  const lat = latitude ? String(latitude) : ''
  const lng = longitude ? String(longitude) : ''
  const publicArea = String(locationName || '').trim().toLowerCase()

  // If the pickup starts with the public area name, that's expected overlap
  // (city/region appearing in both fields). Strip it before fingerprinting.
  let pickupForFingerprint = pickup.toLowerCase()
  if (publicArea && pickupForFingerprint.startsWith(publicArea)) {
    pickupForFingerprint = pickupForFingerprint
      .slice(publicArea.length)
      .replace(/^[\s,·-]+/, '')
  }

  const pickupFingerprint =
    pickupForFingerprint.length >= MIN_PICKUP_LENGTH
      ? pickupForFingerprint.slice(0, FINGERPRINT_LENGTH)
      : ''

  const fieldsToCheck = [
    ['title', title],
    ['description', description],
    ['location_name', locationName],
  ]

  for (const [fieldName, rawValue] of fieldsToCheck) {
    const value = String(rawValue || '').toLowerCase()
    if (!value) continue

    let leaked = false

    if (pickupFingerprint && value.includes(pickupFingerprint)) {
      leaked = true
    }

    if (!leaked && lat && lat.length >= 5 && value.includes(lat.slice(0, 5))) {
      leaked = true
    }
    if (!leaked && lng && lng.length >= 5 && value.includes(lng.slice(0, 5))) {
      leaked = true
    }

    if (leaked) {
      leakedFields.push(fieldName)
    }
  }

  return leakedFields
}

function StatusRow({ complete, label, value, icon }) {
  return (
    <div className="rounded-2xl border border-gold/15 bg-[#071d32]/70 p-4">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${
            complete
              ? 'bg-emerald-400/10 text-emerald-100 ring-emerald-300/20'
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

export default function UpdateListingSidebar({
  title,
  description,
  locationName,
  pickupAddress,
  latitude,
  longitude,
  existingImagesCount,
  removedImagesCount = 0,
  newImagesCount,
  coverSelection,
  error,
  saving,
}) {
  const hasExactPoint = Boolean(latitude && longitude)
  const hasPublicLocation = Boolean(locationName)
  const hasPrivateLocation = Boolean(pickupAddress)
  const hasPhotos = existingImagesCount + newImagesCount > 0
  const hasCover = Boolean(coverSelection)
  const ready = hasExactPoint && hasPublicLocation && hasPrivateLocation && hasPhotos && hasCover

  const leakedFields = detectPickupLeakage({
    title,
    description,
    locationName,
    pickupAddress,
    latitude,
    longitude,
  })
  const hasLeak = leakedFields.length > 0

  return (
    <div className="rounded-[30px] border border-gold/20 bg-navy p-5 shadow-soft md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071d32]/80 text-gold ring-1 ring-gold/20">
          <RocketLaunchIcon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Save
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">
            Update listing
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Save your changes when the listing looks right.
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
              ? 'The listing has the required location, photo, and cover information.'
              : 'Make sure location, photos, and cover photo are set before saving.'}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <StatusRow
          complete={hasPublicLocation}
          label="Public area"
          value={locationName || 'Shown to renters before confirmation'}
          icon={<MapPinIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPrivateLocation && hasExactPoint}
          label="Private pickup point"
          value={
            hasPrivateLocation
              ? `${pickupAddress}${hasExactPoint ? ` · ${latitude}, ${longitude}` : ''}`
              : 'Only confirmed renters can see this'
          }
          icon={<MapPinIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasPhotos}
          label="Photos"
          value={`${existingImagesCount} current · ${newImagesCount} new${
            removedImagesCount ? ` · ${removedImagesCount} removed` : ''
          }`}
          icon={<PhotoIcon className="h-5 w-5" />}
        />

        <StatusRow
          complete={hasCover}
          label="Cover photo"
          value={
            coverSelection?.type === 'existing'
              ? `Existing image #${coverSelection.id}`
              : coverSelection?.type === 'new'
                ? `New upload #${coverSelection.index + 1}`
                : 'Choose one gallery image'
          }
          icon={<PhotoIcon className="h-5 w-5" />}
        />
      </div>

      {hasLeak ? (
        <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="leading-6">
              Your <strong>{leakedFields.map((f) => PUBLIC_FIELD_LABELS[f]).join(', ')}</strong>{' '}
              {leakedFields.length === 1 ? 'looks like it contains' : 'look like they contain'}{' '}
              your pickup address or coordinates. Public fields are visible to anyone — keep
              the exact address only in the private pickup fields.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 font-extrabold text-navy shadow-sm transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RocketLaunchIcon className="h-5 w-5" />
        {saving ? 'Saving changes...' : 'Save changes'}
      </button>
    </div>
  )
}
