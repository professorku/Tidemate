from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from django.urls import path
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.test import APITestCase
from rest_framework.views import APIView


ORIGINAL_API_VIEW_THROTTLE_CLASSES = APIView.throttle_classes
ORIGINAL_SIMPLE_RATE_THROTTLE_RATES = SimpleRateThrottle.THROTTLE_RATES


GLOBAL_THROTTLE_TEST_REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "config.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "user": "1/minute",
    },
}


class GlobalThrottleProbeView(APIView):
    """
    Test-only APIView.

    It intentionally has no throttle_classes set directly.
    This proves that DEFAULT_THROTTLE_CLASSES applies globally.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"detail": "ok"})


urlpatterns = [
    path(
        "test-global-throttle-probe/",
        GlobalThrottleProbeView.as_view(),
        name="test-global-throttle-probe",
    ),
]


@override_settings(
    ROOT_URLCONF=__name__,
    REST_FRAMEWORK=GLOBAL_THROTTLE_TEST_REST_FRAMEWORK,
)
class GlobalThrottleSafetyNetTests(APITestCase):
    def setUp(self):
        cache.clear()

        # DRF reads some throttle settings at import time.
        # Reload them so this test uses the temporary 1/minute rate.
        api_settings.reload()
        APIView.throttle_classes = api_settings.DEFAULT_THROTTLE_CLASSES
        SimpleRateThrottle.THROTTLE_RATES = api_settings.DEFAULT_THROTTLE_RATES

        self.user = User.objects.create_user(
            username="global-throttle-user",
            password="strong-pass-123",
        )

        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        cache.clear()

        APIView.throttle_classes = ORIGINAL_API_VIEW_THROTTLE_CLASSES
        SimpleRateThrottle.THROTTLE_RATES = ORIGINAL_SIMPLE_RATE_THROTTLE_RATES
        api_settings.reload()

    def test_global_user_throttle_applies_to_view_without_explicit_throttle_classes(self):
        first_response = self.client.post(
            "/test-global-throttle-probe/",
            {},
            format="json",
        )

        second_response = self.client.post(
            "/test-global-throttle-probe/",
            {},
            format="json",
        )

        self.assertEqual(first_response.status_code, 200)
        self.assertEqual(second_response.status_code, 429)