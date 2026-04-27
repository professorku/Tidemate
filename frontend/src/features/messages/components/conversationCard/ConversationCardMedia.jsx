import {
  BookmarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  getConversationTypeLabel,
} from '../../utils/chatFormatters'

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
    <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-200 lg:h-auto lg:w-72">
      {conversation.boat_image ? (
        <img
          src={conversation.boat_image}
          alt={conversation.boat_title || 'Boat'}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex h-full min-h-[180px] items-center justify-center text-slate-500">
          <BookmarkIcon className="h-8 w-8" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 via-slate-950/15 to-transparent px-4 pb-4 pt-10 text-white">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/75">
              {getConversationTypeLabel(conversation)}
            </p>
            <h2 className="truncate text-xl font-bold tracking-tight">
              {conversation.boat_title || 'Boat conversation'}
            </h2>
          </div>

          {unreadCount > 0 ? (
            <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-navy shadow-sm">
              {unreadCount} unread
            </span>
          ) : null}
        </div>
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
                className="rounded-full bg-white p-2 text-slate-700 shadow-sm"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggle}
              className="rounded-full bg-white p-2 text-slate-700 shadow-sm"
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          )
        ) : null}
      </div>
    </div>
  )
}
