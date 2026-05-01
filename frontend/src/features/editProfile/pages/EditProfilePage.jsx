import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import EditProfileForm from '../../editProfile/components/EditProfileForm'
import useEditProfilePage from '../../editProfile/hooks/useEditProfilePage'

function LoadingCard() {
  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer size="content" className="py-8 md:py-10" as="div">
        <div className="overflow-hidden rounded-[32px] border border-gold/20 bg-navy shadow-soft">
          <div className="h-32 animate-pulse bg-[#113853]" />
          <div className="space-y-4 p-6 md:p-8">
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-[#071d32]/70" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-[#071d32]/70" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-[#071d32]/70" />
          </div>
        </div>
      </PageContainer>
    </main>
  )
}

export default function EditProfilePage() {
  const {
    formMethods,
    loading,
    saving,
    error,
    success,
    emailChanged,
    avatarPreview,
    selectedAvatarName,
    handleAvatarSelect,
    handleClearAvatar,
    handleSubmit,
    handleCancel,
  } = useEditProfilePage()

  if (loading) {
    return <LoadingCard />
  }

  return (
    <main className="min-h-screen bg-[#071d32]">
      <PageContainer
        size="content"
        className="py-8 md:py-10"
        as="div"
        contentClassName="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
          >
            <ArrowLeftIcon className="h-4 w-4 text-gold" />
            Back to profile
          </Link>

          {success ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
              <CheckCircleIcon className="h-4 w-4" />
              Saved
            </div>
          ) : null}
        </div>

        <section className="overflow-hidden rounded-[32px] border border-gold/20 bg-navy shadow-soft">
          <div className="relative px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute right-8 top-8 hidden rounded-full bg-[#071d32]/80 p-5 text-gold ring-1 ring-gold/20 md:block">
              <SparklesIcon className="h-10 w-10" />
            </div>

            <div className="max-w-3xl">

              <h1 className="mt-4 flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                <PencilSquareIcon className="h-8 w-8 text-gold" />
                Edit your profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
                Update the information renters and hosts see when they visit your profile.
                Email changes require your current password and a verification link.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-gold/20 bg-navy p-5 shadow-soft md:p-7">
          <EditProfileForm
            formMethods={formMethods}
            error={error}
            success={success}
            saving={saving}
            avatarPreview={avatarPreview}
            selectedAvatarName={selectedAvatarName}
            emailChanged={emailChanged}
            onAvatarSelect={handleAvatarSelect}
            onClearAvatar={handleClearAvatar}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </section>
      </PageContainer>
    </main>
  )
}