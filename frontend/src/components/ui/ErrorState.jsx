import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import StatePanel from './StatePanel'

export default function ErrorState({
  title = 'Something went wrong',
  message,
  actionLabel,
  onRetry,
  compact = true,
}) {
  if (!message) return null

  return (
    <StatePanel
      icon={<ExclamationTriangleIcon className="h-8 w-8" />}
      title={title}
      text={message}
      actionLabel={actionLabel || (onRetry ? 'Try again' : undefined)}
      onAction={onRetry}
      tone="error"
      compact={compact}
    />
  )
}
