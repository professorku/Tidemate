from rest_framework.permissions import BasePermission


class IsConversationParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.host_id == request.user.id or obj.renter_id == request.user.id


class IsMessageOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.sender_id == request.user.id
