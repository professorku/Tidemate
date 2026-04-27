from django.urls import path

from .views import (
    ConversationDeleteView,
    ConversationDetailView,
    ConversationMessagesView,
    MessageDeleteView,
    MyConversationsView,
    StartDirectConversationView,
)

urlpatterns = [
    path('conversations/', MyConversationsView.as_view(), name='my-conversations'),
    path('conversations/<int:conversation_id>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('direct/start/', StartDirectConversationView.as_view(), name='start-direct-conversation'),
    path('conversations/<int:conversation_id>/messages/', ConversationMessagesView.as_view(), name='conversation-messages'),
    path('conversations/<int:conversation_id>/delete/', ConversationDeleteView.as_view(), name='conversation-delete'),
    path('messages/<int:message_id>/delete/', MessageDeleteView.as_view(), name='message-delete'),
]
