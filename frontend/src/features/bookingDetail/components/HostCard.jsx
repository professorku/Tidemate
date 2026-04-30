import { Link } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

function getInitials(username) {
  return String(username || 'TM').trim().slice(0, 2).toUpperCase() || 'TM'
}

export default function HostCard({ booking, viewerRole = 'renter' }) {
  const isHostView = viewerRole === 'host'
  const personId = isHostView ? booking.renter_id : booking.host_id
  const username = isHostView ? booking.renter_username : booking.host_username
  const avatar = isHostView ? booking.renter_avatar : null
  const messageHref = booking.conversation_id
    ? `/messages/${booking.conversation_id}`
    : '/messages'

  return (
    <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={username}
              className="h-16 w-16 rounded-full object-cover ring-4 ring-slate-100"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lg font-extrabold text-white ring-4 ring-slate-100">
              {getInitials(username)}
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              {isHostView ? 'Renter' : 'Host'}
            </p>

            <Link
              to={`/users/${personId}`}
              className="mt-1 inline-flex items-center gap-2 text-xl font-extrabold text-slate-900 transition hover:text-navy"
            >
              {username}
              <UserCircleIcon className="h-5 w-5 text-slate-400" />
            </Link>

            <p className="mt-1 text-sm text-slate-500">
              {isHostView
                ? 'This is the renter attached to the booking.'
                : 'This is the person hosting the boat.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to={messageHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-ocean"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Message {isHostView ? 'renter' : 'host'}
          </Link>

          <Link
            to={`/boats/${booking.boat}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View boat listing
          </Link>
        </div>
      </div>
    </div>
  )
}