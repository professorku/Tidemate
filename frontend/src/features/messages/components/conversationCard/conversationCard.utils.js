function getDisplayName(displayName, username, fallback = 'User') {
  return displayName || username || fallback
}

export function getOtherUser(conversation, currentUsername) {
  const isHost = currentUsername === conversation.host_username

  return {
    isHost,
    otherUser: isHost
      ? {
          username: getDisplayName(
            conversation.renter_display_name,
            conversation.renter_username
          ),
          rawUsername: conversation.renter_username,
          avatar: conversation.renter_avatar,
          id: conversation.renter,
        }
      : {
          username: getDisplayName(
            conversation.host_display_name,
            conversation.host_username
          ),
          rawUsername: conversation.host_username,
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