import { Link } from 'react-router-dom'

export default function ConversationCardActions({ conversation }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Link
        to={`/messages/${conversation.id}`}
        className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
      >
        Open conversation
      </Link>

      {conversation.boat ? (
        <Link
          to={`/boats/${conversation.boat}`}
          className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View boat
        </Link>
      ) : null}

      {conversation.booking_id ? (
        <Link
          to={`/bookings/${conversation.booking_id}`}
          className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View booking
        </Link>
      ) : null}
    </div>
  )
}
