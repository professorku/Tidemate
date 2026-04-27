import PageContainer from '../../../components/layout/PageContainer'
import EditProfileForm from '../../editProfile/components/EditProfileForm'
import useEditProfilePage from '../../editProfile/hooks/useEditProfilePage'

function PencilSquareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L8.25 18.463 4.5 19.5l1.037-3.75L16.862 3.487Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 7.5 16.5 4.5"
      />
    </svg>
  )
}

export default function EditProfilePage() {
  const {
    formMethods,
    loading,
    saving,
    error,
    success,
    handleSubmit,
    handleCancel,
  } = useEditProfilePage()

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
        <PageContainer size="narrow" className="py-8 md:py-10" as="div">
          <div className="rounded-[28px] bg-white p-8 shadow-lg">
            Loading profile editor...
          </div>
        </PageContainer>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
      <PageContainer size="narrow" className="py-8 md:py-10" as="div" contentClassName="space-y-0">
        <div className="overflow-hidden rounded-[28px] bg-white shadow-lg">
          <div className="border-b border-slate-100 bg-gradient-to-r from-sky-100 via-white to-cyan-50 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
                <PencilSquareIcon />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Update your personal information and bio.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-8">
            <EditProfileForm
              formMethods={formMethods}
              error={error}
              success={success}
              saving={saving}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </PageContainer>
    </main>
  )
}
