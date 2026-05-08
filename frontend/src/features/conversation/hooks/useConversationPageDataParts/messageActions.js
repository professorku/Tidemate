import { useCallback } from 'react'
import { deleteMessage as deleteChatMessage, sendConversationMessage } from '../../../../api/domains/chat'

function makeTempMessageId() {
  return `pending_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function useConversationMessageActions({
  id,
  text,
  sending,
  meId,
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

      // 1. Optimistic update — show the message immediately so the UI feels
      //    instant regardless of WebSocket latency or fallback path.
      const tempId = makeTempMessageId()
      const optimisticMessage = {
        id: tempId,
        sender: meId,
        text: trimmed,
        created_at: new Date().toISOString(),
        is_read: false,
        is_deleted: false,
        _pending: true,
      }

      setMessages((prev) => [...prev, optimisticMessage])
      setText('')
      setError('')

      try {
        setSending(true)
        const sentOverSocket = socketApi?.sendMessage?.(trimmed)

        if (!sentOverSocket) {
          // 2a. WebSocket unavailable — use REST. The response IS the real
          //     message, so swap the optimistic one with it directly.
          const realMessage = await sendConversationMessage(id, trimmed)
          setMessages((prev) =>
            prev.map((message) =>
              message.id === tempId
                ? { ...realMessage, _pending: false }
                : message
            )
          )
        }
        // 2b. WebSocket path — the broadcast `message.created` will arrive
        //     and `handleSocketMessageCreated` removes the optimistic copy
        //     when matching the echo (see useConversationPageData.js).

        await syncChatState()
        textareaRef.current?.focus()
      } catch (err) {
        console.error(err)
        // 3. Send failed — flag the optimistic message and restore the input
        //    so the user can retry without retyping.
        setMessages((prev) =>
          prev.map((message) =>
            message.id === tempId
              ? { ...message, _pending: false, _failed: true }
              : message
          )
        )
        setText(trimmed)
        setError('Failed to send message.')
      } finally {
        setSending(false)
      }
    },
    [id, meId, sending, setError, setMessages, setSending, setText, socketApi, syncChatState, text, textareaRef]
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