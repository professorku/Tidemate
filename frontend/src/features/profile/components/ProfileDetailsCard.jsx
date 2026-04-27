import {
  CalendarDaysIcon,
  InboxIcon,
  KeyIcon,
  MapPinIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import DetailItem from './DetailItem'
import { formatMemberSince } from '../utils/profileFormatters'

export default function ProfileDetailsCard({ profile }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        Account
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">Profile details</h2>

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
        />

        <DetailItem
          icon={<InboxIcon className="h-5 w-5" />}
          label="Email"
          value={profile.email || 'Not added yet'}
        />

        <DetailItem
          icon={<CalendarDaysIcon className="h-5 w-5" />}
          label="Member since"
          value={formatMemberSince(profile.member_since)}
        />
      </div>

      <Link
        to="/change-password"
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <KeyIcon className="h-4 w-4" />
        Change password
      </Link>
    </div>
  )
}
