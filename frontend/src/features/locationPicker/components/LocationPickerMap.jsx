import { Suspense, lazy } from 'react'
import RouteLoadingFallback from '../../../components/ui/RouteLoadingFallback'
import LocationPickerHelpCard from './LocationPickerHelpCard'
import LocationPickerSearchPanel from './LocationPickerSearchPanel'
import SelectedLocationCard from './SelectedLocationCard'
import { useLocationPicker } from '../hooks/useLocationPicker'

const LocationPickerLeafletMap = lazy(() => import('./LocationPickerLeafletMap'))

export default function LocationPickerMap(props) {
  const {
    initialCenter,
    markerPosition,
    searchQuery,
    setSearchQuery,
    results,
    searching,
    searchError,
    reverseLoading,
    handlePickCoordinates,
    handleSearchSelect,
    handleClearSearch,
  } = useLocationPicker(props)

  const {
    latitude,
    longitude,
    locationName,
    pickupAddress,
  } = props

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900">
          Choose exact boat location
        </h2>
        <p className="text-slate-600">
          Search for a place or click directly on the map. Public users only see
          the nearest city or area. You, admins, and confirmed renters can see the
          exact location.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <LocationPickerSearchPanel
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searching={searching}
          searchError={searchError}
          results={results}
          onClearSearch={handleClearSearch}
          onSearchSelect={handleSearchSelect}
        />

        <SelectedLocationCard
          locationName={locationName}
          pickupAddress={pickupAddress}
          latitude={latitude}
          longitude={longitude}
          reverseLoading={reverseLoading}
        />

        <Suspense
          fallback={
            <RouteLoadingFallback
              title="Loading map"
              text="Preparing the interactive location picker."
            />
          }
        >
          <LocationPickerLeafletMap
            markerPosition={markerPosition}
            initialCenter={initialCenter}
            locationName={locationName}
            onPickCoordinates={handlePickCoordinates}
          />
        </Suspense>

        <LocationPickerHelpCard />
      </div>
    </div>
  )
}