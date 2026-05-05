import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  EllipsisHorizontalIcon,
  FlagIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Avatar from '../../../components/ui/Avatar'
import ReportModal from '../../../components/reports/ReportModal'
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
  const [isReportOpen, setIsReportOpen] = useState(false)

  const isDeleted = Boolean(message.is_deleted)
  const canDelete = mine && !isDeleted
  const canReport = !mine && !isDeleted
  const hasActions = canDelete || canReport
  const isDeleting = deletingMessageId === message.id

  return (
    <>
      <div className={`group flex ${mine ? 'justify-end' : 'justify-start'}`}>
        <div
          {...bind}
          className={`flex max-w-[92%] items-end gap-3 md:max-w-[78%] ${
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
              <p className="mb-1 px-1 text-xs font-bold text-gold">
                {sender?.username || 'User'}
              </p>
            ) : null}

            <div className="flex items-start gap-2">
              {hasActions && revealed ? (
                <div className={`flex items-center gap-2 ${mine ? 'order-1' : 'order-2'}`}>
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(message)}
                      disabled={isDeleting}
                      className="rounded-full bg-red-600 p-2 text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete message"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  ) : null}

                  {canReport ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsReportOpen(true)
                        hide()
                      }}
                      className="rounded-full bg-red-600 p-2 text-white shadow-sm transition hover:bg-red-700"
                      aria-label="Report message"
                    >
                      <FlagIcon className="h-4 w-4" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={hide}
                    className="rounded-full bg-gold p-2 text-navy shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d]"
                    aria-label="Hide message actions"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : hasActions ? (
                <button
                  type="button"
                  onClick={toggle}
                  className={`rounded-full bg-gold p-2 text-navy opacity-0 shadow-sm ring-1 ring-gold/40 transition hover:bg-[#d8b45d] group-hover:opacity-100 ${
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
                    ? 'rounded-br-md bg-gold text-navy ring-1 ring-gold/40'
                    : 'rounded-bl-md border border-white/15 bg-white/10 text-white',
                  isDeleted ? 'italic opacity-70' : '',
                ].join(' ')}
              >
                <p className="whitespace-pre-wrap break-words text-[15px] leading-6">
                  {message.text}
                </p>
              </div>
            </div>

            <p
              className={`mt-1 px-1 text-xs text-white/45 ${
                mine ? 'text-right' : 'text-left'
              }`}
            >
              {isDeleting
                ? 'Deleting...'
                : `${formatTimeOnly(message.created_at)}${
                    mine && !isDeleted ? ` · ${message.is_read ? 'Read' : 'Sent'}` : ''
                  }`}
            </p>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        targetType="message"
        targetId={message.id}
        targetLabel={`message from ${sender?.username || message.sender_username || 'user'}`}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  )
}