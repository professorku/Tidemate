import { Link } from 'react-router-dom'
import Avatar from '../../../../components/ui/Avatar'
import {
  formatDateTime,
  formatRelative,
  getBookingStatusClass,
  getConversationTypeClass,
  getConversationTypeLabel,
  getTripStateClass,
  getTripStateLabel,
} from '../../utils/chatFormatters'

export default function ConversationCardSummary({
  conversation,
  otherUser,
  canDelete,
  lastMessage,
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getConversationTypeClass(
              conversation
            )}`}
          >
            {getConversationTypeLabel(conversation)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getTripStateClass(
              conversation
            )}`}
          >
            {getTripStateLabel(conversation)}
          </span>

          {conversation.booking_status ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getBookingStatusClass(
                conversation.booking_status
              )}`}
            >
              {conversation.booking_status}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-3">
          {otherUser.id ? (
            <Link to={`/users/${otherUser.id}`} className="shrink-0">
              <Avatar avatar={otherUser.avatar} username={otherUser.username} />
            </Link>
          ) : (
            <Avatar avatar={otherUser.avatar} username={otherUser.username} />
          )}

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Chatting with
            </p>

            {otherUser.id ? (
              <Link
                to={`/users/${otherUser.id}`}
                className="truncate text-sm font-semibold text-slate-800 hover:underline"
              >
                {otherUser.username || 'User'}
              </Link>
            ) : (
              <p className="truncate text-sm font-semibold text-slate-800">
                {otherUser.username || 'User'}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{lastMessage}</p>

        {!canDelete ? (
          <p className="mt-3 text-xs font-medium text-slate-500">
            Delete becomes available when the linked booking is cancelled or completed.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl bg-slate-50 p-4 md:min-w-[180px]">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Last activity
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">
          {formatRelative(conversation.updated_at || conversation.last_message_at)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDateTime(conversation.updated_at || conversation.last_message_at)}
        </p>
      </div>
    </div>
  )
}
