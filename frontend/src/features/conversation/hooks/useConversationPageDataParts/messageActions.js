import { useCallback } from 'react'
import { deleteMessage as deleteChatMessage, sendConversationMessage } from '../../../../api/domains/chat'

export function useConversationMessageActions({
  id,
  text,
  sending,
  loadMessages,
  socketApi,
  setText,
  setError,
  setSending,
  textareaRef,
  setMessages,
  setDeletingMessageId,
  syncChatState,
}) {
  const sendMessage = useCallback(
    async (e) => {
      e.preventDefault()

      const trimmed = text.trim()
      if (!trimmed || sending) return

      try {
        setSending(true)
        const sentOverSocket = socketApi?.sendMessage?.(trimmed)

        if (!sentOverSocket) {
          await sendConversationMessage(id, trimmed)
          await loadMessages()
        }

        setText('')
        setError('')
        await syncChatState()
        textareaRef.current?.focus()
      } catch (err) {
        console.error(err)
        setError('Failed to send message.')
      } finally {
        setSending(false)
      }
    },
    [id, loadMessages, sending, setError, setSending, setText, socketApi, syncChatState, text, textareaRef]
  )

  const deleteMessage = useCallback(
    async (message) => {
      setDeletingMessageId(message.id)

      try {
        const deletedOverSocket = socketApi?.deleteMessage?.(message.id)

        if (!deletedOverSocket) {
          const updated = await deleteChatMessage(message.id)
          setMessages((prev) =>
            prev.map((item) => (item.id === message.id ? { ...item, ...updated } : item))
          )
          await syncChatState()
        }
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        setDeletingMessageId(null)
      }
    },
    [setDeletingMessageId, setMessages, socketApi, syncChatState]
  )

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage(e)
      }
    },
    [sendMessage]
  )

  const handleQuickPrompt = useCallback(
    (prompt) => {
      setText(prompt)
      textareaRef.current?.focus()
    },
    [setText, textareaRef]
  )

  return {
    sendMessage,
    deleteMessage,
    handleKeyDown,
    handleQuickPrompt,
  }
}
