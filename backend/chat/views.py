from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import ConversationsPagination, MessagesCursorPagination
from config.throttling import ChatRateThrottle

from .selectors import (
    get_conversation_messages,
    get_direct_conversation_between_users,
    get_message_with_conversation,
    get_target_user_by_id,
    get_user_conversation_counts,
    get_user_conversations,
    get_visible_conversation_for_user,
    mark_messages_as_read_for_viewer,
)
from .serializers import ConversationSerializer, MessageSerializer
from .services import (
    delete_conversation,
    delete_message,
    ensure_user_can_access_conversation,
    send_message,
    start_direct_conversation,
)


def get_target_user_or_response(target_user_id):
    if not target_user_id:
        return None, Response(
            {"detail": "user_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    target_user = get_target_user_by_id(target_user_id)
    if not target_user:
        return None, Response(
            {"detail": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return target_user, None


def get_conversation_or_response(user, conversation_id):
    conversation = get_visible_conversation_for_user(user, conversation_id)

    if not conversation:
        return None, Response(
            {"detail": "Conversation not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        ensure_user_can_access_conversation(
            conversation=conversation,
            user=user,
        )
    except PermissionError as exc:
        return None, Response(
            {"detail": str(exc)},
            status=status.HTTP_403_FORBIDDEN,
        )

    return conversation, None


def get_message_or_response(message_id):
    message = get_message_with_conversation(message_id)

    if not message:
        return None, Response(
            {"detail": "Message not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return message, None


class MyConversationsView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    pagination_class = ConversationsPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return get_user_conversations(self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        response.data["conversation_counts"] = get_user_conversation_counts(request.user)
        return response


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "conversation_id"

    def get_object(self):
        conversation = get_visible_conversation_for_user(
            self.request.user,
            self.kwargs[self.lookup_url_kwarg],
        )

        if not conversation:
            raise NotFound("Conversation not found.")

        try:
            ensure_user_can_access_conversation(
                conversation=conversation,
                user=self.request.user,
            )
        except PermissionError as exc:
            raise PermissionDenied(str(exc))

        self.check_object_permissions(self.request, conversation)
        return conversation

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class StartDirectConversationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ChatRateThrottle]

    def post(self, request):
        target_user, error_response = get_target_user_or_response(
            request.data.get("user_id")
        )

        if error_response:
            return error_response

        existing_conversation = get_direct_conversation_between_users(
            request.user,
            target_user,
        )

        try:
            conversation, created = start_direct_conversation(
                actor=request.user,
                target_user=target_user,
                existing_conversation=existing_conversation,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ConversationSerializer(
            conversation,
            context={"request": request},
        )

        return Response(
            {
                "conversation": serializer.data,
                "created": created,
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ConversationMessagesView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    pagination_class = MessagesCursorPagination
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ChatRateThrottle]

    def _get_conversation_or_response(self):
        return get_conversation_or_response(
            self.request.user,
            self.kwargs["conversation_id"],
        )

    def get_queryset(self):
        conversation, error_response = self._get_conversation_or_response()

        if error_response:
            return self.serializer_class.Meta.model.objects.none()

        mark_messages_as_read_for_viewer(conversation, self.request.user)
        return get_conversation_messages(conversation)

    def list(self, request, *args, **kwargs):
        conversation, error_response = self._get_conversation_or_response()

        if error_response:
            return error_response

        mark_messages_as_read_for_viewer(conversation, request.user)

        queryset = get_conversation_messages(conversation)
        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        conversation, error_response = self._get_conversation_or_response()

        if error_response:
            return error_response

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = send_message(
            conversation=conversation,
            sender=request.user,
            serializer=serializer,
        )

        output_serializer = self.get_serializer(message)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class ConversationDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, conversation_id):
        conversation, error_response = get_conversation_or_response(
            request.user,
            conversation_id,
        )

        if error_response:
            return error_response

        try:
            delete_conversation(
                conversation=conversation,
                actor=request.user,
            )
        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class MessageDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, message_id):
        message, error_response = get_message_or_response(message_id)

        if error_response:
            return error_response

        try:
            message = delete_message(
                message=message,
                actor=request.user,
            )
        except PermissionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_200_OK)