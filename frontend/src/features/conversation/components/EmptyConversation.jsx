import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import StatePanel from '../../../components/ui/StatePanel'

export default function EmptyConversation({ otherUsername }) {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <StatePanel
        icon={<ChatBubbleLeftRightIcon className="h-8 w-8" />}
        title="No messages yet"
        text={`Start the conversation with ${otherUsername || 'the other person'}. You could ask about pickup, safety equipment, fuel policy, or what is included.`}
        tone="subtle"
        compact
      />
    </div>
  )
}
