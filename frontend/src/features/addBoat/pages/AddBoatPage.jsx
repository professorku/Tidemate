import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  LifebuoyIcon,
  MapPinIcon,
  PhotoIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import LocationPickerMap from '../../locationPicker/components/LocationPickerMap'
import AddBoatDetailsSection from '../../addBoat/components/AddBoatDetailsSection'
import AddBoatPhotosSection from '../../addBoat/components/AddBoatPhotosSection'
import AddBoatPublishCard from '../../addBoat/components/AddBoatPublishCard'
import { useAddBoatPage } from '../../addBoat/hooks/useAddBoatPage'

function StepPill({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
      {icon}
      {label}
    </span>
  )
}

export default function AddBoatPage() {
  const {
    formMethods,
    form,
    images,
    previews,
    coverIndex,
    loading,
    error,
    handleLocationChange,
    handleImagesChange,
    removeImageAt,
    setCoverIndex,
    handleSubmit,
  } = useAddBoatPage()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <PageContainer
        size="wide"
        as="div"
        className="py-8 md:py-10"
        contentClassName="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/my-boats"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to host dashboard
          </Link>
        </div>

        <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-sm">
          <div className="relative border-b border-slate-100 bg-gradient-to-br from-white via-sky-50 to-white px-6 py-8 md:px-8 md:py-10">
            <div className="absolute right-8 top-8 hidden rounded-full bg-white p-5 text-navy shadow-sm ring-1 ring-slate-200 md:block">
              <LifebuoyIcon className="h-10 w-10" />
            </div>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm">
                <SparklesIcon className="h-4 w-4 text-gold" />
                New listing
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Add your boat
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                Create a listing renters can trust. Add clear details, choose the
                exact private pickup point, and upload strong photos.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <StepPill icon={<LifebuoyIcon className="h-4 w-4 text-navy" />} label="Boat details" />
                <StepPill icon={<MapPinIcon className="h-4 w-4 text-navy" />} label="Private location" />
                <StepPill icon={<PhotoIcon className="h-4 w-4 text-navy" />} label="Photo gallery" />
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="space-y-8">
              <AddBoatDetailsSection
                register={formMethods.register}
                errors={formMethods.formState.errors}
                form={form}
                disabled={loading}
              />

              <LocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                locationName={form.location_name}
                pickupAddress={form.pickup_address}
                onLocationChange={handleLocationChange}
              />

              <AddBoatPhotosSection
                previews={previews}
                coverIndex={coverIndex}
                onImagesChange={handleImagesChange}
                onSetCoverIndex={setCoverIndex}
                onRemoveImage={removeImageAt}
                disabled={loading}
              />
            </section>

            <aside className="xl:sticky xl:top-24 xl:self-start">
              <AddBoatPublishCard
                form={form}
                images={images}
                coverIndex={coverIndex}
                error={error}
                loading={loading}
              />
            </aside>
          </div>
        </form>
      </PageContainer>
    </main>
  )
}