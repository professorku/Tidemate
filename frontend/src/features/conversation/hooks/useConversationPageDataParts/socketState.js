export function upsertConversationMessage(existingMessages, nextMessage) {
  const nextId = Number(nextMessage?.id)
  if (!nextId) {
    return existingMessages
  }

  const alreadyExists = existingMessages.some((message) => Number(message.id) === nextId)
  if (alreadyExists) {
    return existingMessages.map((message) =>
      Number(message.id) === nextId ? { ...message, ...nextMessage } : message
    )
  }

  return [...existingMessages, nextMessage].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

export function applyDeletedConversationMessage(existingMessages, deletedMessage) {
  return existingMessages.map((message) =>
    Number(message.id) === Number(deletedMessage?.id) ? { ...message, ...deletedMessage } : message
  )
}
