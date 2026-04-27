import { ArrowPathIcon } from '@heroicons/react/24/outline'
import StatePanel from './StatePanel'

export default function LoadingState({
  title = 'Loading',
  text = 'We are getting everything ready for you.',
  icon = <ArrowPathIcon className="h-8 w-8" />,
  compact = true,
}) {
  return (
    <StatePanel
      icon={icon}
      title={title}
      text={text}
      tone="subtle"
      compact={compact}
    />
  )
}
