from rest_framework.permissions import BasePermission


class IsBookingParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.renter_id == request.user.id or obj.boat.host_id == request.user.id
