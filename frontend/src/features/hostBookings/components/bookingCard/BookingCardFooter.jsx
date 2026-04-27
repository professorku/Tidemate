import { Link } from 'react-router-dom'

export default function BookingCardFooter({ booking, canDelete, isProcessing, handleDelete }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/boats/${booking.boat}`}
        className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        View boat
      </Link>

      <Link
        to={booking.conversation_id ? `/messages/${booking.conversation_id}` : '/messages'}
        className="rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Message renter
      </Link>

      {canDelete ? (
        <button
          type="button"
          onClick={() => handleDelete(booking)}
          disabled={isProcessing}
          className="rounded-full bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isProcessing ? 'Deleting...' : 'Delete'}
        </button>
      ) : null}
    </div>
  )
}
