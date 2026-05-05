from rest_framework import generics, permissions, status
from rest_framework.response import Response

from audit.services import write_audit_event
from config.throttling import ReportRateThrottle

from .serializers import ReportCreateSerializer


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ReportRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        report = serializer.save()
        response_serializer = self.get_serializer(report)

        write_audit_event(
            action='report.created',
            request=request,
            target_type=report.target_type,
            target_id=report.target_object_id,
            severity='warning',
            metadata={
                'report_id': report.id,
                'reason': report.reason,
            },
        )

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)