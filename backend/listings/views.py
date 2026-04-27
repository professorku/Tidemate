# backend/listings/views.py
import logging
from urllib.error import URLError

from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from config.pagination import ListingsPagination
from config.throttling import (
    ConditionsAnonRateThrottle,
    ListingWriteRateThrottle,
    PublicListingsAnonRateThrottle,
)

from .models import BoatListing
from .permissions import IsListingOwner
from .serializer_helpers import build_serializer_context
from .serializers import BoatListingSerializer
from .selectors import (
    get_public_listings_queryset,
    get_boat_detail_queryset,
    get_my_boats_queryset,
)
from .services.listing_search import filter_listings
from .services.marine_conditions import MarineConditionsError, get_boat_conditions

logger = logging.getLogger(__name__)


class BoatListCreateView(generics.ListCreateAPIView):
    serializer_class = BoatListingSerializer
    pagination_class = ListingsPagination
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    throttle_classes = [ListingWriteRateThrottle, PublicListingsAnonRateThrottle]

    def list(self, request, *args, **kwargs):
        if "limit" in request.query_params:
            return Response(
                {"detail": "Use page and page_size for listing pagination. The limit parameter is not supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().list(request, *args, **kwargs)

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = get_public_listings_queryset(self.request.user)
        return filter_listings(queryset, self.request.query_params)

    def get_serializer_context(self):
        return build_serializer_context(self, super().get_serializer_context())


class BoatDetailView(generics.RetrieveAPIView):
    serializer_class = BoatListingSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return get_boat_detail_queryset(self.request.user)

    def get_serializer_context(self):
        return build_serializer_context(self, super().get_serializer_context())


class BoatConditionsView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ConditionsAnonRateThrottle]

    def get(self, request, pk):
        try:
            boat = BoatListing.objects.get(pk=pk)
        except BoatListing.DoesNotExist:
            return Response({"detail": "Boat not found."}, status=404)

        if boat.latitude is None or boat.longitude is None:
            return Response(
                {"detail": "This boat does not have map coordinates yet."},
                status=400,
            )

        try:
            conditions = get_boat_conditions(
                latitude=float(boat.latitude),
                longitude=float(boat.longitude),
            )
        except (TypeError, ValueError) as exc:
            logger.warning("Invalid coordinates for boat %s: %s", boat.id, exc)
            return Response(
                {"detail": "This boat has invalid map coordinates."},
                status=400,
            )
        except MarineConditionsError as exc:
            logger.warning("Marine conditions lookup failed for boat %s: %s", boat.id, exc)
            return Response(
                {"detail": "Could not fetch forecast data right now."},
                status=502,
            )

        if not conditions:
            return Response(
                {"detail": "No forecast data available right now."},
                status=502,
            )

        return Response({
            "boat_id": boat.id,
            "location_name": boat.location_name,
            **conditions,
        })


class MyBoatsView(generics.ListAPIView):
    serializer_class = BoatListingSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ListingsPagination

    def list(self, request, *args, **kwargs):
        if "limit" in request.query_params:
            return Response(
                {"detail": "Use page and page_size for listing pagination. The limit parameter is not supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        return get_my_boats_queryset(self.request.user)

    def get_serializer_context(self):
        return build_serializer_context(self, super().get_serializer_context())


class MyBoatUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BoatListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsListingOwner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    throttle_classes = [ListingWriteRateThrottle]

    def get_queryset(self):
        return get_my_boats_queryset(self.request.user)

    def get_serializer_context(self):
        return build_serializer_context(self, super().get_serializer_context())