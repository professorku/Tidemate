import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

export default function MessageComposer({
  text,
  setText,
  sending,
  onSubmit,
  onKeyDown,
  textareaRef,
}) {
  return (
    <form onSubmit={onSubmit} className="border-t border-slate-200 bg-white px-4 py-4 md:px-6 md:py-5">
      <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
        <textarea
          ref={textareaRef}
          className="min-h-[110px] w-full resize-none rounded-2xl bg-transparent p-3 text-slate-800 outline-none placeholder:text-slate-400"
          placeholder="Ask about pickup time, what is included, safety equipment, or anything else..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Press <span className="font-semibold text-slate-700">Enter</span> to send and{' '}
            <span className="font-semibold text-slate-700">Shift + Enter</span> for a new line.
          </div>

          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-2.5 font-semibold text-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            {sending ? 'Sending...' : 'Send message'}
          </button>
        </div>
      </div>
    </form>
  )
}
