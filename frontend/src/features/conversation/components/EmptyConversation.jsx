import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

export default function EmptyConversation({ otherUsername }) {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <div className="max-w-xl rounded-[30px] border border-white/15 bg-navy px-6 py-10 text-center text-white shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-navy shadow-sm ring-1 ring-gold/40">
          <ChatBubbleLeftRightIcon className="h-8 w-8" />
        </div>

        <h3 className="mt-5 text-2xl font-black tracking-tight text-white">
          No messages yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/65">
          Start the conversation with {otherUsername || 'the other person'}. You could
          ask about pickup, safety equipment, fuel policy, or what is included.
        </p>
      </div>
    </div>
  )
}