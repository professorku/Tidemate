import { Suspense, lazy } from 'react'
import RouteLoadingFallback from '../../../components/ui/RouteLoadingFallback'

const BoatMap = lazy(() => import('../../../components/BoatMap'))


export default function BoatDetailLocation({ boat }) {
  return (
    <div className="mt-6 rounded-[22px] bg-white p-5 shadow-soft md:p-6">
      <h2 className="mb-4 text-xl font-bold text-slate-900">
        Boat location
      </h2>

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
    </div>
  )
}
