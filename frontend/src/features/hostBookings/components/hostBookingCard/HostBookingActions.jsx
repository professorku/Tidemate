import { Link } from 'react-router-dom'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EyeIcon,
  LifebuoyIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { getBookingPath } from '../../../../utils/bookingReference'

export default function HostBookingActions({
  booking,
  boatId,
  messageLink,
  isActionLoading,
  canConfirm,
  canCancel,
  isCancelled,
  canDelete,
  onConfirm,
  onCancel,
  onDelete,
}) {
  return (
    <div className="flex flex-wrap gap-2 border-t border-white/15 pt-5">
      <Link
        to={getBookingPath(booking)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-extrabold text-navy shadow-sm ring-1 ring-gold/40 transition hover:-translate-y-0.5 hover:bg-[#d8b45d]"
      >
        <EyeIcon className="h-4 w-4" />
        View booking
      </Link>

      {boatId ? (
        <Link
          to={`/boats/${boatId}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
        >
          <LifebuoyIcon className="h-4 w-4" />
          View boat
        </Link>
      ) : null}

      <Link
        to={messageLink}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ocean"
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
        Messages
      </Link>

      {canConfirm ? (
        <button
          type="button"
          onClick={() => onConfirm(booking)}
          disabled={isActionLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircleIcon className="h-4 w-4" />
          {isActionLoading ? 'Confirming...' : 'Confirm'}
        </button>
      ) : null}

      {canCancel && !isCancelled ? (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          disabled={isActionLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <XCircleIcon className="h-4 w-4" />
          {isActionLoading ? 'Cancelling...' : 'Cancel'}
        </button>
      ) : null}

      {canDelete ? (
        <button
          type="button"
          onClick={() => onDelete(booking)}
          disabled={isActionLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" />
          {isActionLoading ? 'Deleting...' : 'Delete'}
        </button>
      ) : null}
    </div>
  )
}