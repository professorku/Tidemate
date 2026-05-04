import { MapPinIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import BaseBoatCard from '../boats/BaseBoatCard'
import BoatCardMedia from '../boats/BoatCardMedia'
import { formatCurrency } from '../../utils/format/number'

export default function BoatPreviewCard({
  boat,
  badge,
  actionLabel = 'View boat →',
  className = '',
  imageClassName = 'h-52',
  showLocation = true,
  showGuests = true,
  metaAsPills = false,
  priceSuffix = '',
}) {
  const guestsLabel = `${boat.guests || 0} guest${boat.guests === 1 ? '' : 's'}`

  return (
    <BaseBoatCard
      to={`/boats/${boat.id}`}
      className={className}
      media={(
        <BoatCardMedia
          className={`${imageClassName} overflow-hidden bg-slate-200`}
          image={boat.thumbnail || boat.image}
          title={boat.title}
          emptyLabel={<UserCircleIcon className="h-10 w-10" />}
          imageClassName="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      )}
      content={(
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold text-slate-900">{boat.title}</h3>

              {!metaAsPills ? (
                <p className="mt-1 text-sm text-slate-600">
                  {showLocation ? boat.location_name || 'Location not set' : null}
                  {showLocation && showGuests ? ' · ' : null}
                  {showGuests ? guestsLabel : null}
                </p>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {showLocation ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                      <MapPinIcon className="h-4 w-4" />
                      {boat.location_name || 'Location not added'}
                    </span>
                  ) : null}

                  {showGuests ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                      <UserGroupIcon className="h-4 w-4" />
                      {guestsLabel}
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {badge ? (
              <div className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate-700">
                {badge}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Price per day
              </p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">
                {formatCurrency(boat.price_per_day)}{priceSuffix}
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-700 transition group-hover:text-slate-900">
              {actionLabel}
            </span>
          </div>
        </>
      )}
    />
  )
}
