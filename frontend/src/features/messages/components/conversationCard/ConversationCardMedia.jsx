import {
  BookmarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { getConversationTypeLabel } from '../../utils/chatFormatters'

export default function ConversationCardMedia({
  conversation,
  unreadCount,
  canDelete,
  revealed,
  isDeleting,
  onDelete,
  toggle,
  hide,
}) {
  return (
    <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-100 lg:h-auto lg:w-72">
      {conversation.boat_image ? (
        <img
          src={conversation.boat_image}
          alt={conversation.boat_title || 'Boat'}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full min-h-[200px] items-center justify-center text-slate-400">
          <BookmarkIcon className="h-10 w-10" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-800 shadow-sm backdrop-blur">
          {getConversationTypeLabel(conversation)}
        </span>

        {unreadCount > 0 ? (
          <span className="rounded-full bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-navy shadow-sm">
            {unreadCount} unread
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-12 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
          Conversation
        </p>
        <h2 className="mt-1 truncate text-xl font-extrabold tracking-tight">
          {conversation.boat_title || 'Direct conversation'}
        </h2>
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-2">
        {canDelete ? (
          revealed ? (
            <>
              <button
                type="button"
                onClick={() => onDelete(conversation)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>

              <button
                type="button"
                onClick={hide}
                className="rounded-full bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-white"
                aria-label="Hide actions"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggle}
              className="rounded-full bg-white/95 p-2 text-slate-700 shadow-sm transition hover:bg-white"
              aria-label="Show actions"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          )
        ) : null}
      </div>
    </div>
  )
} 