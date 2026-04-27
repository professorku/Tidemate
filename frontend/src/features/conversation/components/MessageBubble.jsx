import { Link } from 'react-router-dom'
import {
  EllipsisHorizontalIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../../../components/ui/Avatar'
import useLongPressReveal from '../../../utils/useLongPressReveal'
import { formatTimeOnly } from '../utils/conversationFormatters'

export default function MessageBubble({
  message,
  mine,
  sender,
  showAvatar,
  onDelete,
  deletingMessageId,
}) {
  const { revealed, toggle, hide, bind } = useLongPressReveal()
  const isDeleted = Boolean(message.is_deleted)
  const canDelete = mine && !isDeleted
  const isDeleting = deletingMessageId === message.id

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        {...bind}
        className={`flex max-w-[88%] items-end gap-3 md:max-w-[78%] ${
          mine ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="w-9 shrink-0">
          {!mine && showAvatar ? (
            sender?.userId ? (
              <Link to={`/users/${sender.userId}`} title={sender.username || 'User'}>
                <Avatar avatar={sender.avatar} username={sender.username} size="sm" />
              </Link>
            ) : (
              <Avatar avatar={sender?.avatar} username={sender?.username} size="sm" />
            )
          ) : null}
        </div>

        <div className={mine ? 'text-right' : 'text-left'}>
          {!mine && showAvatar ? (
            <p className="mb-1 px-1 text-xs font-semibold text-slate-500">
              {sender?.username || 'User'}
            </p>
          ) : null}

          <div className="flex items-start gap-2">
            {canDelete && revealed ? (
              <div className={`flex items-center gap-2 ${mine ? 'order-1' : 'order-2'}`}>
                <button
                  type="button"
                  onClick={() => onDelete(message)}
                  disabled={isDeleting}
                  className="rounded-full bg-red-600 p-2 text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={hide}
                  className="rounded-full bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : canDelete ? (
              <button
                type="button"
                onClick={toggle}
                className={`rounded-full bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 ${
                  mine ? 'order-1' : 'order-2'
                }`}
                aria-label="Show message actions"
              >
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
            ) : null}

            <div
              className={[
                'max-w-full rounded-[26px] px-5 py-3.5 shadow-sm',
                mine
                  ? 'rounded-br-md bg-slate-900 text-white ring-1 ring-slate-900/5'
                  : 'rounded-bl-md border border-slate-200 bg-white text-slate-900',
                isDeleted ? 'italic opacity-75' : '',
              ].join(' ')}
            >
              <p className="whitespace-pre-wrap break-words text-[15px] leading-6">
                {message.text}
              </p>
            </div>
          </div>

          <p className={`mt-1 px-1 text-xs text-slate-500 ${mine ? 'text-right' : 'text-left'}`}>
            {isDeleting ? 'Deleting...' : formatTimeOnly(message.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}
