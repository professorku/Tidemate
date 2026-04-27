export function getOtherUser(conversation, currentUsername) {
  const isHost = currentUsername === conversation.host_username

  return {
    isHost,
    otherUser: isHost
      ? {
          username: conversation.renter_username,
          avatar: conversation.renter_avatar,
          id: conversation.renter,
        }
      : {
          username: conversation.host_username,
          avatar: conversation.host_avatar,
          id: conversation.host,
        },
  }
}

export function getConversationLastMessage(conversation) {
  return (
    conversation.last_message_text ||
    conversation.last_message ||
    'Open conversation to view messages.'
  )
}
