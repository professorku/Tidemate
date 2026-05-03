import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

import { getConversationBookingPath } from '../../../../utils/bookingReference'

const bookingPath = getConversationBookingPath(conversation)

export default function ConversationCardActions({ conversation }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-white/15 pt-5">
      <Link
        to={`/messages/${conversation.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
      >
        Open conversation
        <ArrowRightIcon className="h-4 w-4" />
      </Link>

      {conversation.boat ? (
        <Link
          to={`/boats/${conversation.boat}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
        >
          <EyeIcon className="h-4 w-4" />
          View boat
        </Link>
      ) : null}

      {bookingPath ? (
        <Link
          to={bookingPath}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
        >
          <CalendarDaysIcon className="h-4 w-4" />
          View booking
        </Link>
      ) : null}
    </div>
  )
}