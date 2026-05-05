from urllib.parse import parse_qs, urlparse

from rest_framework.pagination import CursorPagination, PageNumberPagination
from rest_framework.response import Response


class BasePageNumberPagination(PageNumberPagination):
    page_size_query_param = "page_size"
    ordering = ()

    def get_paginated_response(self, data):
        next_link = self.get_next_link()
        previous_link = self.get_previous_link()
        page_size = self.get_page_size(self.request)
        count = self.page.paginator.count
        total_pages = self.page.paginator.num_pages

        return Response(
            {
                "count": count,
                "next": next_link,
                "previous": previous_link,
                "current_page": self.page.number,
                "total_pages": total_pages,
                "page_size": page_size,
                "pagination": {
                    "type": "page_number",
                    "count": count,
                    "next": next_link,
                    "previous": previous_link,
                    "page": self.page.number,
                    "total_pages": total_pages,
                    "page_size": page_size,
                    "has_next": bool(next_link),
                    "has_previous": bool(previous_link),
                    "ordering": list(self.ordering),
                },
                "results": data,
            }
        )


class BaseCursorPagination(CursorPagination):
    page_size_query_param = "page_size"
    ordering = ("-created_at", "-id")

    @staticmethod
    def _extract_cursor(link):
        if not link:
            return None

        parsed = urlparse(link)
        values = parse_qs(parsed.query).get("cursor")
        return values[0] if values else None

    def get_paginated_response(self, data):
        next_link = self.get_next_link()
        previous_link = self.get_previous_link()
        page_size = self.get_page_size(self.request)

        return Response(
            {
                "next": next_link,
                "previous": previous_link,
                "page_size": page_size,
                "pagination": {
                    "type": "cursor",
                    "count": None,
                    "next": next_link,
                    "previous": previous_link,
                    "page": None,
                    "total_pages": None,
                    "page_size": page_size,
                    "has_next": bool(next_link),
                    "has_previous": bool(previous_link),
                    "next_cursor": self._extract_cursor(next_link),
                    "previous_cursor": self._extract_cursor(previous_link),
                    "ordering": list(self.ordering),
                },
                "results": data,
            }
        )


class ListingsPagination(BasePageNumberPagination):
    page_size = 12
    max_page_size = 48
    ordering = ("-created_at", "-id")


class ConversationsPagination(BasePageNumberPagination):
    page_size = 20
    max_page_size = 50
    ordering = ("-latest_message_at", "-created_at", "-id")


class MessagesCursorPagination(BaseCursorPagination):
    page_size = 30
    max_page_size = 100
    ordering = ("-created_at", "-id")


class ReviewsPagination(BasePageNumberPagination):
    page_size = 5
    max_page_size = 20
    ordering = ("-created_at", "-id")


class BookingsPagination(BasePageNumberPagination):
    page_size = 8
    max_page_size = 40
    ordering = ("-created_at", "-id")


class FavoritesPagination(BasePageNumberPagination):
    page_size = 9
    max_page_size = 36
    ordering = ("-created_at", "-id")


class NotificationsPagination(BasePageNumberPagination):
    page_size = 12
    max_page_size = 50
    ordering = ("-created_at", "-id")

class ModerationReportsPagination(BasePageNumberPagination):
    page_size = 12
    max_page_size = 50
    ordering = ("-created_at", "-id")
