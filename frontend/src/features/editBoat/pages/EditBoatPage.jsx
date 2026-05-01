import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import LocationPickerMap from '../../locationPicker/components/LocationPickerMap'
import LoadingState from '../../../components/ui/LoadingState'
import ErrorState from '../../../components/ui/ErrorState'
import BoatDetailsForm from '../../editBoat/components/BoatDetailsForm'
import EditBoatHero from '../../editBoat/components/EditBoatHero'
import PhotosSection from '../../editBoat/components/PhotosSection'
import UpdateListingSidebar from '../../editBoat/components/UpdateListingSidebar'
import useEditBoatPageData from '../../editBoat/hooks/useEditBoatPageData'

export default function EditBoatPage() {
  const {
    boat,
    formMethods,
    form,
    existingImages,
    removedImageIds,
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
    reload,
  } = useEditBoatPageData()

  if (loading) {
    return (
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer size="content" as="div" className="py-8 md:py-10">
          <LoadingState
            title="Loading boat"
            text="We are fetching your listing details so you can edit them."
            compact={false}
          />
        </PageContainer>
      </main>
    )
  }

  if (!boat) {
    return (
      <main className="min-h-screen bg-[#071d32]">
        <PageContainer size="content" as="div" className="py-8 md:py-10">
          <ErrorState
            title="Could not load listing"
            message={error || 'The listing could not be loaded.'}
            actionLabel="Try again"
            onRetry={reload}
            compact={false}
          />

          <div className="mt-5">
            <Link
              to="/my-boats"
              className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gold" />
              Back to host dashboard
            </Link>
          </div>
        </PageContainer>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer
        size="wide"
        as="div"
        className="py-8 md:py-10"
        contentClassName="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/my-boats"
            className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
          >
            <ArrowLeftIcon className="h-4 w-4 text-gold" />
            Back to host dashboard
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white/80 shadow-sm">
            <ExclamationTriangleIcon className="h-4 w-4 text-gold" />
            Changes apply after saving
          </div>
        </div>

        <EditBoatHero
          boat={boat}
          existingImagesCount={existingImages.length}
          newImagesCount={newImages.length}
          removedImagesCount={removedImageIds.length}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
            <section className="space-y-8">
              <BoatDetailsForm
                register={formMethods.register}
                errors={formMethods.formState.errors}
                form={form}
                disabled={saving}
              />

              <LocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                locationName={form.location_name}
                pickupAddress={form.pickup_address}
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
                disabled={saving}
              />
            </section>

            <aside className="xl:sticky xl:top-24 xl:self-start">
              <UpdateListingSidebar
                locationName={form.location_name}
                pickupAddress={form.pickup_address}
                latitude={form.latitude}
                longitude={form.longitude}
                existingImagesCount={existingImages.length}
                removedImagesCount={removedImageIds.length}
                newImagesCount={newImages.length}
                coverSelection={coverSelection}
                error={error}
                saving={saving}
              />
            </aside>
          </div>
        </form>
      </PageContainer>
    </main>
  )
}