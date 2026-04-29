import PageContainer from '../../../components/layout/PageContainer'
import LocationPickerMap from '../../locationPicker/components/LocationPickerMap'
import AddBoatDetailsSection from '../../addBoat/components/AddBoatDetailsSection'
import AddBoatPhotosSection from '../../addBoat/components/AddBoatPhotosSection'
import AddBoatPublishCard from '../../addBoat/components/AddBoatPublishCard'
import { useAddBoatPage } from '../../addBoat/hooks/useAddBoatPage'

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
    <PageContainer className="py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900">Add your boat</h1>
        <p className="mt-2 text-slate-600">
          Upload multiple photos, choose a cover image, and pin the exact location.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-8">
            <AddBoatDetailsSection
              register={formMethods.register}
              errors={formMethods.formState.errors}
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
  )
}