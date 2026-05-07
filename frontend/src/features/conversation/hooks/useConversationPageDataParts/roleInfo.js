function getDisplayName(displayName, username, fallback = 'User') {
  return displayName || username || fallback
}

export function buildConversationRoleInfo({ conversation, me }) {
  if (!conversation || !me) {
    return {
      myUsername: '',
      myUserId: null,
      myAvatar: null,
      otherUsername: '',
      otherUserId: null,
      otherAvatar: null,
    }
  }

  const hostDisplayName = getDisplayName(
    conversation.host_display_name,
    conversation.host_username
  )

  const renterDisplayName = getDisplayName(
    conversation.renter_display_name,
    conversation.renter_username
  )

  if (me.username === conversation.host_username) {
    return {
      myUsername: hostDisplayName,
      myUserId: conversation.host,
      myAvatar: conversation.host_avatar,
      otherUsername: renterDisplayName,
      otherUserId: conversation.renter,
      otherAvatar: conversation.renter_avatar,
    }
  }

  return {
    myUsername: renterDisplayName,
    myUserId: conversation.renter,
    myAvatar: conversation.renter_avatar,
    otherUsername: hostDisplayName,
    otherUserId: conversation.host,
    otherAvatar: conversation.host_avatar,
  }
}

export function getAvatarForConversationMessage(conversation, message) {
  if (!conversation) return null

  const hostDisplayName = getDisplayName(
    conversation.host_display_name,
    conversation.host_username
  )

  const renterDisplayName = getDisplayName(
    conversation.renter_display_name,
    conversation.renter_username
  )

  if (message.sender_username === conversation.host_username) {
    return {
      avatar: conversation.host_avatar,
      username: hostDisplayName,
      rawUsername: conversation.host_username,
      userId: conversation.host,
    }
  }

  if (message.sender_username === conversation.renter_username) {
    return {
      avatar: conversation.renter_avatar,
      username: renterDisplayName,
      rawUsername: conversation.renter_username,
      userId: conversation.renter,
    }
  }

  return {
    avatar: null,
    username: getDisplayName(message.sender_display_name, message.sender_username),
    rawUsername: message.sender_username,
    userId: null,
  }
}

export function getQuickPromptsForConversation(conversation) {
  if (!conversation) return []

  if (conversation.conversation_type === 'direct') {
    return [
      'Hi! I am interested in this boat. Is it still available?',
      'Can you tell me what is included with the rental?',
      'Where is pickup and return?',
    ]
  }

  return [
    'Hi! What time should I arrive for pickup?',
    'Can you confirm what is included in the booking?',
    'Is there anything I should bring for the trip?',
  ]
}