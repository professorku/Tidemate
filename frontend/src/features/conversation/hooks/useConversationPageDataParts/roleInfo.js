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

  if (me.username === conversation.host_username) {
    return {
      myUsername: conversation.host_username,
      myUserId: conversation.host,
      myAvatar: conversation.host_avatar,
      otherUsername: conversation.renter_username,
      otherUserId: conversation.renter,
      otherAvatar: conversation.renter_avatar,
    }
  }

  return {
    myUsername: conversation.renter_username,
    myUserId: conversation.renter,
    myAvatar: conversation.renter_avatar,
    otherUsername: conversation.host_username,
    otherUserId: conversation.host,
    otherAvatar: conversation.host_avatar,
  }
}

export function getAvatarForConversationMessage(conversation, message) {
  if (!conversation) return null

  if (message.sender_username === conversation.host_username) {
    return {
      avatar: conversation.host_avatar,
      username: conversation.host_username,
      userId: conversation.host,
    }
  }

  if (message.sender_username === conversation.renter_username) {
    return {
      avatar: conversation.renter_avatar,
      username: conversation.renter_username,
      userId: conversation.renter,
    }
  }

  return {
    avatar: null,
    username: message.sender_username,
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
