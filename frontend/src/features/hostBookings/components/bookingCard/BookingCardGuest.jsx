import { Link } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

function getInitial(username) {
  return username?.slice(0, 1)?.toUpperCase() || '?'
}

export default function BookingCardGuest({ booking }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-50">
            {booking.renter_avatar ? (
              <img
                src={booking.renter_avatar}
                alt={booking.renter_username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-base font-extrabold text-navy">
                {getInitial(booking.renter_username)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Renter
            </p>

            <Link
              to={`/users/${booking.renter_id || booking.renter}`}
              className="mt-0.5 inline-flex items-center gap-1.5 truncate text-base font-extrabold text-slate-900 transition hover:text-navy"
            >
              {booking.renter_username || 'Renter'}
              <UserCircleIcon className="h-4 w-4 text-slate-400" />
            </Link>

            <p className="mt-0.5 text-sm text-slate-500">
              Requested to rent your boat.
            </p>
          </div>
        </div>

        <Link
          to={booking.conversation_id ? `/messages/${booking.conversation_id}` : '/messages'}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          Message
        </Link>
      </div>
    </div>
  )
}