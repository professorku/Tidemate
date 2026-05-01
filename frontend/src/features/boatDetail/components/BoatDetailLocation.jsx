import { Suspense, lazy } from 'react'
import {
  MapIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import RouteLoadingFallback from '../../../components/ui/RouteLoadingFallback'
import {
  canShowExactLocation,
  getBoatLocationLabel,
} from '../../../utils/locationPrivacy'

const BoatMap = lazy(() => import('../../../components/BoatMap'))

export default function BoatDetailLocation({ boat }) {
  const exactLocationVisible = canShowExactLocation(boat)
  const locationLabel = getBoatLocationLabel(boat, 'Location available after booking')

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-navy">
            <MapIcon className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
              Location
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
              {exactLocationVisible ? 'Exact pickup location' : 'Approximate trip area'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {boat?.location_disclosure_message ||
                'The exact pickup point is only shared with confirmed renters.'}
            </p>
          </div>
        </div>

        <div
          className={`inline-flex items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
            exactLocationVisible
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{locationLabel}</span>
        </div>
      </div>

      <Suspense
        fallback={
          <RouteLoadingFallback
            title="Loading map"
            text="Preparing the boat location view."
          />
        }
      >
        <BoatMap boat={boat} />
      </Suspense>
    </section>
  )
}