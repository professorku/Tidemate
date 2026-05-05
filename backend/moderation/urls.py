from django.urls import path

from .views import (
    ModerationReportDetailView,
    ModerationReportListView,
    ModerationReportStatsView,
)


urlpatterns = [
    path('reports/', ModerationReportListView.as_view(), name='moderation-report-list'),
    path('reports/stats/', ModerationReportStatsView.as_view(), name='moderation-report-stats'),
    path('reports/<int:pk>/', ModerationReportDetailView.as_view(), name='moderation-report-detail'),
]