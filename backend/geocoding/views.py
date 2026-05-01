from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.throttling import GeocodingRateThrottle

from .services import GeocodingError, reverse_geocode, search_places


class GeocodingSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [GeocodingRateThrottle]

    def get(self, request):
        query = request.query_params.get("q", "")

        try:
            results = search_places(query)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except GeocodingError:
            return Response(
                {"detail": "Could not search for location right now."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"results": results})


class GeocodingReverseView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [GeocodingRateThrottle]

    def get(self, request):
        latitude = request.query_params.get("lat")
        longitude = request.query_params.get("lon")

        try:
            result = reverse_geocode(latitude, longitude)
        except ValueError:
            return Response(
                {"detail": "Valid lat and lon query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except GeocodingError:
            return Response(
                {"detail": "Could not fetch location details right now."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(result)