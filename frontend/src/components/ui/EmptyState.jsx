import { InboxIcon } from '@heroicons/react/24/outline'
import StatePanel from './StatePanel'

export default function EmptyState({
  title = 'Nothing here yet',
  text = 'Content will appear here when it becomes available.',
  actionLabel,
  actionTo,
  onAction,
  icon = <InboxIcon className="h-8 w-8" />,
  compact = true,
  tone = 'neutral',
}) {
  return (
    <StatePanel
      icon={icon}
      title={title}
      text={text}
      actionLabel={actionLabel}
      actionTo={actionTo}
      onAction={onAction}
      tone={tone}
      compact={compact}
    />
  )
}
