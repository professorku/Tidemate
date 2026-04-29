import { Link } from 'react-router-dom'
import {
  EllipsisHorizontalIcon,
  MapPinIcon,
  TrashIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import BaseBoatCard from '../../../components/boats/BaseBoatCard'
import BoatCardMedia from '../../../components/boats/BoatCardMedia'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import {
  getBoatLocationLabel,
  getBoatPublicLocationLabel,
} from '../../../utils/locationPrivacy'

export default function BoatCard({ boat, onDelete, deletingId }) {
  const { revealed, toggle, hide, bind } = useLongPressReveal()
  const isDeleting = deletingId === boat.id
  const locationLabel = getBoatLocationLabel(boat)
  const publicLocationLabel = getBoatPublicLocationLabel(boat, '')

  return (
    <BaseBoatCard
      {...bind}
      className="rounded-[24px]"
      bodyClassName="space-y-4 p-4 md:p-5"
      media={(
        <BoatCardMedia
          className="relative h-44 bg-slate-100"
          image={boat.image}
          title={boat.title}
          topContent={(
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold capitalize text-slate-800 shadow-sm backdrop-blur">
                  {boat.boat_type}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-sm backdrop-blur">
                  <UserGroupIcon className="h-3.5 w-3.5" />
                  {boat.guests} guests
                </span>
              </div>

              <div className="flex items-center gap-2">
                {revealed ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDelete(boat.id, boat.title)
                      }}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        hide()
                      }}
                      className="rounded-full bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggle()
                    }}
                    className="rounded-full bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                    aria-label="Show actions"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          )}
          bottomContent={(
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 via-slate-950/20 to-transparent px-4 pb-3 pt-10 text-white">
              <h2 className="text-lg font-bold tracking-tight">{boat.title}</h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/90">
                <MapPinIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{locationLabel}</span>
              </p>
            </div>
          )}
        />
      )}
      content={(
        <>
          {publicLocationLabel && publicLocationLabel !== locationLabel ? (
            <div className="rounded-[20px] bg-emerald-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Public area
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-900">
                {publicLocationLabel}
              </p>
            </div>
          ) : null}

          <div className="rounded-[20px] bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Price per day
            </p>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">
              {boat.price_per_day} kr
              <span className="ml-1 text-sm font-medium text-slate-500">/ day</span>
            </p>
          </div>

          {revealed ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Hold on mobile or tap the menu button to reveal quick actions.
            </div>
          ) : null}
        </>
      )}
      footer={(
        <div className="grid grid-cols-3 gap-2">
          <Link
            to={`/boats/${boat.id}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View
          </Link>

          <Link
            to={`/my-boats/${boat.id}/edit`}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => onDelete(boat.id, boat.title)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-full bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    />
  )
}