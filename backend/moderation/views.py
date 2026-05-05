from django.db.models import Count, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from audit.services import write_audit_event
from config.pagination import ModerationReportsPagination
from config.throttling import ModerationRateThrottle
from reports.models import Report

from .serializers import ReportModerationSerializer


class ModerationReportQuerysetMixin:
    def get_queryset(self):
        queryset = (
            Report.objects
            .select_related(
                'reporter',
                'listing',
                'listing__host',
                'reported_user',
                'review',
                'review__reviewer',
                'review__reviewed_user',
                'review__boat',
                'message',
                'message__sender',
                'message__conversation',
            )
            .all()
        )

        status_filter = self.request.query_params.get('status', '').strip()
        target_type = self.request.query_params.get('target_type', '').strip()
        reason = self.request.query_params.get('reason', '').strip()
        search = self.request.query_params.get('q', '').strip()

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        if target_type:
            queryset = queryset.filter(target_type=target_type)

        if reason:
            queryset = queryset.filter(reason=reason)

        if search:
            queryset = queryset.filter(
                Q(details__icontains=search) |
                Q(admin_notes__icontains=search) |
                Q(reporter__username__icontains=search) |
                Q(reporter__email__icontains=search) |
                Q(listing__title__icontains=search) |
                Q(reported_user__username__icontains=search) |
                Q(reported_user__email__icontains=search) |
                Q(review__comment__icontains=search) |
                Q(review__reviewer__username__icontains=search) |
                Q(message__text__icontains=search) |
                Q(message__sender__username__icontains=search)
            ).distinct()

        return queryset


class ModerationReportListView(ModerationReportQuerysetMixin, generics.ListAPIView):
    serializer_class = ReportModerationSerializer
    permission_classes = [permissions.IsAdminUser]
    throttle_classes = [ModerationRateThrottle]
    pagination_class = ModerationReportsPagination


class ModerationReportDetailView(ModerationReportQuerysetMixin, generics.RetrieveUpdateAPIView):
    serializer_class = ReportModerationSerializer
    permission_classes = [permissions.IsAdminUser]
    throttle_classes = [ModerationRateThrottle]
    http_method_names = ['get', 'patch', 'head', 'options']

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status

        response = super().partial_update(request, *args, **kwargs)

        instance.refresh_from_db()

        write_audit_event(
            action='moderation.report.updated',
            request=request,
            target_type='report',
            target_id=instance.id,
            severity='warning',
            metadata={
                'old_status': old_status,
                'new_status': instance.status,
                'report_target_type': instance.target_type,
                'report_target_id': instance.target_object_id,
            },
        )

        return response


class ModerationReportStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    throttle_classes = [ModerationRateThrottle]

    def get(self, request):
        base = Report.objects.all()

        status_counts = {
            row['status']: row['count']
            for row in base.values('status').annotate(count=Count('id'))
        }

        target_counts = {
            row['target_type']: row['count']
            for row in base.values('target_type').annotate(count=Count('id'))
        }

        return Response(
            {
                'total': base.count(),
                'pending': status_counts.get(Report.Status.PENDING, 0),
                'reviewing': status_counts.get(Report.Status.REVIEWING, 0),
                'resolved': status_counts.get(Report.Status.RESOLVED, 0),
                'dismissed': status_counts.get(Report.Status.DISMISSED, 0),
                'listings': target_counts.get(Report.TargetType.LISTING, 0),
                'users': target_counts.get(Report.TargetType.USER, 0),
                'reviews': target_counts.get(Report.TargetType.REVIEW, 0),
                'messages': target_counts.get(Report.TargetType.MESSAGE, 0),
            },
            status=status.HTTP_200_OK,
        )