import PageContainer from '../../../components/layout/PageContainer'
import LocationPickerMap from '../../locationPicker/components/LocationPickerMap'
import LoadingState from '../../../components/ui/LoadingState'
import BoatDetailsForm from '../../editBoat/components/BoatDetailsForm'
import EditBoatHero from '../../editBoat/components/EditBoatHero'
import PhotosSection from '../../editBoat/components/PhotosSection'
import UpdateListingSidebar from '../../editBoat/components/UpdateListingSidebar'
import useEditBoatPageData from '../../editBoat/hooks/useEditBoatPageData'

export default function EditBoatPage() {
  const {
    formMethods,
    form,
    existingImages,
    newImages,
    newPreviews,
    coverSelection,
    loading,
    saving,
    error,
    handleLocationChange,
    handleNewImagesChange,
    removeExistingImage,
    removeNewImage,
    setExistingImageAsCover,
    setNewImageAsCover,
    handleSubmit,
  } = useEditBoatPageData()

  if (loading) {
    return (
      <PageContainer size="narrow" className="py-6 md:py-8">
        <LoadingState
          title="Loading boat"
          text="We are fetching your listing details so you can edit them."
          compact={false}
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-6 md:py-8">
      <EditBoatHero />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-8">
            <BoatDetailsForm
              register={formMethods.register}
              errors={formMethods.formState.errors}
            />

            <LocationPickerMap
              latitude={form.latitude}
              longitude={form.longitude}
              locationName={form.location_name}
              onLocationChange={handleLocationChange}
            />

            <PhotosSection
              existingImages={existingImages}
              newPreviews={newPreviews}
              coverSelection={coverSelection}
              onFileChange={handleNewImagesChange}
              onSetExistingCover={setExistingImageAsCover}
              onSetNewCover={setNewImageAsCover}
              onRemoveExisting={removeExistingImage}
              onRemoveNew={removeNewImage}
            />
          </section>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <UpdateListingSidebar
              locationName={form.location_name}
              pickupAddress={form.pickup_address}
              existingImagesCount={existingImages.length}
              newImagesCount={newImages.length}
              error={error}
              saving={saving}
            />
          </aside>
        </div>
      </form>
    </PageContainer>
  )
}