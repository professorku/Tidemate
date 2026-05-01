import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

export default function ConversationCardActions({ conversation }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Link
        to={`/messages/${conversation.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-ocean"
      >
        Open conversation
        <ArrowRightIcon className="h-4 w-4" />
      </Link>

      {conversation.boat ? (
        <Link
          to={`/boats/${conversation.boat}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <EyeIcon className="h-4 w-4" />
          View boat
        </Link>
      ) : null}

      {conversation.booking_id ? (
        <Link
          to={`/bookings/${conversation.booking_id}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          View booking
        </Link>
      ) : null}
    </div>
  )
}