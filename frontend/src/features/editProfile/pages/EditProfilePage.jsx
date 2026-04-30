  import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import PageContainer from '../../../components/layout/PageContainer'
import EditProfileForm from '../../editProfile/components/EditProfileForm'
import useEditProfilePage from '../../editProfile/hooks/useEditProfilePage'

function LoadingCard() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
      <PageContainer size="content" className="py-8 md:py-10" as="div">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
          <div className="h-32 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          <div className="space-y-4 p-6 md:p-8">
            <div className="h-5 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </PageContainer>
    </main>
  )
}

function PreviewCard({ preview, profileCompletion, emailChanged, pendingEmail }) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-navy via-ocean to-slate-800" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            {preview.avatar ? (
              <img
                src={preview.avatar}
                alt={preview.username}
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gold text-2xl font-extrabold text-navy shadow-lg">
                {preview.initials}
              </div>
            )}

            <div className="min-w-0 pb-2">
              <p className="truncate text-lg font-extrabold text-slate-900">
                {preview.username}
              </p>
              <p className="truncate text-sm text-slate-500">
                {preview.location || 'Location not added'}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">
                Profile completion
              </span>
              <span className="text-sm font-bold text-navy">{profileCompletion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex gap-3 rounded-2xl border border-slate-100 p-3">
              <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="font-semibold text-slate-700">Email</dt>
                <dd className="truncate text-slate-500">{preview.email || 'Not added'}</dd>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-slate-100 p-3">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="font-semibold text-slate-700">Location</dt>
                <dd className="truncate text-slate-500">
                  {preview.location || 'Not added'}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Bio preview
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {preview.bio ||
                'Write a short bio so renters and hosts know who they are talking to.'}
            </p>
          </div>
        </div>
      </div>

      {emailChanged || pendingEmail ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Email verification required</p>
              <p className="mt-1 leading-6">
                TideMate keeps your current email active until the new address is verified.
              </p>
              {pendingEmail ? (
                <p className="mt-2 font-semibold">Pending: {pendingEmail}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

export default function EditProfilePage() {
  const {
    formMethods,
    loading,
    saving,
    error,
    success,
    preview,
    profileCompletion,
    emailChanged,
    pendingEmail,
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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100">
      <PageContainer
        size="wide"
        className="py-8 md:py-10"
        as="div"
        contentClassName="space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to profile
          </Link>

          {success ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircleIcon className="h-4 w-4" />
              Saved
            </div>
          ) : null}
        </div>

        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
          <div className="relative bg-gradient-to-r from-navy via-ocean to-slate-900 px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute right-8 top-8 hidden rounded-full bg-white/10 p-5 text-white/80 md:block">
              <SparklesIcon className="h-10 w-10" />
            </div>

            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/80">
                <UserCircleIcon className="h-4 w-4" />
                Account settings
              </span>

              <h1 className="mt-4 flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                <PencilSquareIcon className="h-8 w-8 text-gold" />
                Edit your profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                Update the information renters and hosts see when they visit your profile.
                Email changes require your current password and a verification link.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
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
          </div>

          <PreviewCard
            preview={preview}
            profileCompletion={profileCompletion}
            emailChanged={emailChanged}
            pendingEmail={pendingEmail}
          />
        </section>
      </PageContainer>
    </main>
  )
}