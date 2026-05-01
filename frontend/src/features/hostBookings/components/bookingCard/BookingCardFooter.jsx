import { Link } from 'react-router-dom'
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

export default function BookingCardFooter({
  booking,
  canDelete,
  isProcessing,
  handleDelete,
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-5">
      <Link
        to={`/bookings/${booking.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-ocean"
      >
        <CalendarDaysIcon className="h-4 w-4" />
        View booking
      </Link>

      <Link
        to={`/boats/${booking.boat}`}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <EyeIcon className="h-4 w-4" />
        View boat
      </Link>

      <Link
        to={booking.conversation_id ? `/messages/${booking.conversation_id}` : '/messages'}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
        Message renter
      </Link>

      {canDelete ? (
        <button
          type="button"
          onClick={() => handleDelete(booking)}
          disabled={isProcessing}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" />
          {isProcessing ? 'Deleting...' : 'Delete'}
        </button>
      ) : null}
    </div>
  )
}