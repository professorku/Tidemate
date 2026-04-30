import {
  CalendarDaysIcon,
  EnvelopeIcon,
  KeyIcon,
  MapPinIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import DetailItem from './DetailItem'
import {
  formatAverageRating,
  formatMemberSince,
} from '../utils/profileFormatters'

export default function ProfileDetailsCard({
  profile,
  reviewsData,
  boats,
  profileCompletion,
  missingProfileItems,
}) {
  const hasPendingEmail = Boolean(profile.email_change_pending || profile.pending_email)

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-navy">
        Account
      </p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
        Profile details
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your private account basics and public profile information.
      </p>

      <div className="mt-5 space-y-3">
        <DetailItem
          icon={<UserCircleIcon className="h-5 w-5" />}
          label="Username"
          value={profile.username}
        />

        <DetailItem
          icon={<MapPinIcon className="h-5 w-5" />}
          label="Location"
          value={profile.location || 'Not added yet'}
          empty={!profile.location}
        />

        <DetailItem
          icon={<EnvelopeIcon className="h-5 w-5" />}
          label="Email"
          value={profile.email || 'Not added yet'}
          empty={!profile.email}
        />

        <DetailItem
          icon={<CalendarDaysIcon className="h-5 w-5" />}
          label="Member since"
          value={formatMemberSince(profile.member_since)}
        />

        <DetailItem
          icon={<ShieldCheckIcon className="h-5 w-5" />}
          label="Profile completion"
          value={`${profileCompletion}% complete`}
        />

        <DetailItem
          icon={<LifebuoyIconSafe />}
          label="Hosting"
          value={`${boats.length} boat${boats.length === 1 ? '' : 's'} listed`}
        />

        <DetailItem
          icon={<StarIconSafe />}
          label="Reviews"
          value={formatAverageRating(reviewsData.average_rating)}
        />
      </div>

      {hasPendingEmail ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Email change pending</p>
          <p className="mt-1 leading-6">
            Verify the new email address before TideMate switches your account over.
          </p>
          {profile.pending_email ? (
            <p className="mt-2 font-semibold">{profile.pending_email}</p>
          ) : null}
        </div>
      ) : null}

      {missingProfileItems.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-900">Missing info</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Add {missingProfileItems.join(', ')} to complete your profile.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2">
        <Link
          to="/profile/edit"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-ocean"
        >
          <PencilSquareIcon className="h-4 w-4" />
          Edit profile
        </Link>

        <Link
          to="/change-password"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <KeyIcon className="h-4 w-4" />
          Change password
        </Link>
      </div>
    </div>
  )
}

function LifebuoyIconSafe() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8.7 8.7 5.8 5.8M15.3 8.7l2.9-2.9M15.3 15.3l2.9 2.9M8.7 15.3l-2.9 2.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  )
}

function StarIconSafe() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m12 3.5 2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.77 6.8 19.5l.99-5.79-4.21-4.1 5.82-.85L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}