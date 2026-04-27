from rest_framework.permissions import BasePermission


class IsListingOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.host_id == request.user.id
