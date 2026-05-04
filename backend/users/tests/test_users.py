from unittest.mock import patch
from django.conf import settings
from django.contrib.auth.models import User
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from rest_framework.test import APIClient

from users.email_verification import build_email_verification_token
from users.profile_serializers import MyProfileSerializer


class AuthFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='captain',
            email='captain@example.com',
            password='strong-pass-123',
        )
        self.csrf_client = Client(enforce_csrf_checks=True)

    def _prime_csrf(self):
        response = self.csrf_client.get('/api/users/csrf/')
        self.assertEqual(response.status_code, 200)
        csrf_cookie = response.cookies['csrftoken'].value
        return csrf_cookie

    def test_login_requires_csrf_token(self):
        response = self.csrf_client.post(
            '/api/users/login/',
            {'username': 'captain', 'password': 'strong-pass-123'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)

    def test_login_sets_refresh_cookie_when_csrf_token_is_present(self):
        csrf_token = self._prime_csrf()

        response = self.csrf_client.post(
            '/api/users/login/',
            {'username': 'captain', 'password': 'strong-pass-123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detail'], 'Logged in.')
        access_cookie = response.cookies[settings.JWT_ACCESS_COOKIE_NAME]
        self.assertTrue(access_cookie.value)
        self.assertTrue(access_cookie['httponly'])
        refresh_cookie = response.cookies[settings.JWT_REFRESH_COOKIE_NAME]
        self.assertTrue(refresh_cookie.value)
        self.assertTrue(refresh_cookie['httponly'])

    def test_refresh_rotates_cookie_and_logout_blacklists_refresh_token(self):
        csrf_token = self._prime_csrf()

        login_response = self.csrf_client.post(
            '/api/users/login/',
            {'username': 'captain', 'password': 'strong-pass-123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        original_refresh = login_response.cookies[settings.JWT_REFRESH_COOKIE_NAME].value

        refresh_response = self.csrf_client.post(
            '/api/users/refresh/',
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(refresh_response.status_code, 200)
        rotated_refresh = refresh_response.cookies[settings.JWT_REFRESH_COOKIE_NAME].value
        self.assertNotEqual(original_refresh, rotated_refresh)

        logout_response = self.csrf_client.post(
            '/api/users/logout/',
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(logout_response.status_code, 200)

        self.csrf_client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = rotated_refresh
        blacklisted_refresh_response = self.csrf_client.post(
            '/api/users/refresh/',
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(blacklisted_refresh_response.status_code, 401)

    def test_refresh_returns_401_when_device_session_is_revoked(self):
        csrf_token = self._prime_csrf()

        self.csrf_client.post(
            '/api/users/login/',
            {'username': 'captain', 'password': 'strong-pass-123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        logout_response = self.csrf_client.post(
            '/api/users/logout/',
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(logout_response.status_code, 200)

        refresh_response = self.csrf_client.post(
            '/api/users/refresh/',
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(refresh_response.status_code, 401)

    def test_authenticated_user_can_access_me_with_access_cookie(self):
        api_client = APIClient()
        login_client = Client(enforce_csrf_checks=True)
        csrf_response = login_client.get('/api/users/csrf/')
        csrf_token = csrf_response.cookies['csrftoken'].value
        login_response = login_client.post(
            '/api/users/login/',
            {'username': 'captain', 'password': 'strong-pass-123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        api_client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[settings.JWT_ACCESS_COOKIE_NAME].value

        response = api_client.get('/api/users/me/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['username'], 'captain')


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class EmailVerificationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        csrf_response = self.client.get('/api/users/csrf/')
        self.csrf_token = csrf_response.cookies['csrftoken'].value

    def test_signup_creates_inactive_user_and_sends_verification_email(self):
        response = self.client.post(
            '/api/users/signup/',
            {
                'username': 'newcaptain',
                'email': 'newcaptain@example.com',
                'password': 'strong-pass-123',
            },
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='newcaptain')
        self.assertFalse(user.is_active)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('/verify-email?token=', mail.outbox[0].body)

    def test_wrong_password_returns_same_generic_error_as_unverified_user(self):
        User.objects.create_user(
            username='activecaptain',
            email='active@example.com',
            password='strong-pass-123',
            is_active=True,
        )

        response = self.client.post(
            '/api/users/login/',
            {'username': 'activecaptain', 'password': 'wrong-password'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()['detail'], 'Invalid username or password.')

    def test_verify_email_activates_user(self):
        user = User.objects.create_user(
            username='verifyme',
            email='verifyme@example.com',
            password='strong-pass-123',
            is_active=False,
        )
        token = build_email_verification_token(user)

        response = self.client.post(
            '/api/users/verify-email/',
            {'token': token},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_active)

    def test_resend_verification_email_is_generic(self):
        User.objects.create_user(
            username='resendme',
            email='resendme@example.com',
            password='strong-pass-123',
            is_active=False,
        )

        response = self.client.post(
            '/api/users/resend-verification/',
            {'email': 'resendme@example.com'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('If an unverified account exists', response.json()['detail'])
        self.assertEqual(len(mail.outbox), 1)


@override_settings(
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    REST_FRAMEWORK={
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_RATES": {
            **settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"],
            "auth_anon": "2/minute",
        },
    },
)
class AuthThrottleRegressionTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        csrf_response = self.client.get('/api/users/csrf/')
        self.csrf_token = csrf_response.cookies['csrftoken'].value

    def test_signup_is_not_blocked_by_login_attempts_on_same_ip(self):
        User.objects.create_user(
            username='throttlecaptain',
            email='throttlecaptain@example.com',
            password='strong-pass-123',
            is_active=True,
        )

        for _ in range(2):
            response = self.client.post(
                '/api/users/login/',
                {'username': 'throttlecaptain', 'password': 'wrong-password'},
                content_type='application/json',
                HTTP_X_CSRFTOKEN=self.csrf_token,
            )
            self.assertEqual(response.status_code, 401)

        signup_response = self.client.post(
            '/api/users/signup/',
            {
                'username': 'freshcaptain',
                'email': 'freshcaptain@example.com',
                'password': 'strong-pass-123',
            },
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(signup_response.status_code, 201)


class AuthSettingsTests(TestCase):
    def test_access_token_lifetime_is_short_lived(self):
        self.assertEqual(int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()), 15 * 60)




class HealthCheckTests(TestCase):
    def test_health_check_returns_minimal_public_status(self):
        response = Client().get('/api/users/health/')

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body['status'], 'ok')
        self.assertNotIn('checks', body)
        self.assertNotIn('environment', body)

    def test_health_check_header_does_not_expose_details_for_public_clients(self):
        response = Client().get('/api/users/health/', HTTP_X_HEALTH_DETAILS='1')

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertNotIn('checks', body)
        self.assertNotIn('environment', body)

    @override_settings(DEBUG=True)
    def test_health_check_can_return_detailed_status_in_debug(self):
        response = Client().get('/api/users/health/')

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn('checks', body)
        self.assertEqual(body['checks']['database']['status'], 'ok')
        self.assertEqual(body['checks']['channel_layer']['status'], 'ok')

    @patch('users.views._database_healthcheck', side_effect=RuntimeError('db down'))
    @override_settings(DEBUG=True)
    def test_health_check_returns_503_when_database_probe_fails(self, _mock_db):
        response = Client().get('/api/users/health/')

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertEqual(body['status'], 'degraded')
        self.assertEqual(body['checks']['database']['status'], 'error')
        self.assertEqual(body['checks']['database']['detail'], 'db down')

    @patch('users.views._channel_layer_healthcheck', side_effect=RuntimeError('redis down'))
    @override_settings(DEBUG=True)
    def test_health_check_returns_503_when_channel_layer_probe_fails(self, _mock_channel):
        response = Client().get('/api/users/health/')

        self.assertEqual(response.status_code, 503)
        body = response.json()
        self.assertEqual(body['status'], 'degraded')
        self.assertEqual(body['checks']['channel_layer']['status'], 'error')
        self.assertEqual(body['checks']['channel_layer']['detail'], 'redis down')


class SignupValidationTests(TestCase):
    def test_signup_serializer_rejects_short_passwords(self):
        client = Client(enforce_csrf_checks=True)
        csrf_response = client.get('/api/users/csrf/')
        csrf_token = csrf_response.cookies['csrftoken'].value

        response = client.post(
            '/api/users/signup/',
            {
                'username': 'shortpw',
                'email': 'shortpw@example.com',
                'password': 'short',
            },
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.json())


class ProfileUploadValidationTests(TestCase):
    def test_avatar_upload_rejects_non_image_content_type(self):
        user = User.objects.create_user(username='avatar-user', password='strong-pass-123')
        serializer = MyProfileSerializer(
            instance=user.profile,
            data={
                'email': 'avatar@example.com',
                'avatar_upload': SimpleUploadedFile(
                    'avatar.txt',
                    b'not-an-image',
                    content_type='text/plain',
                ),
            },
            partial=True,
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('avatar_upload', serializer.errors)



@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PasswordResetFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='resetcaptain',
            email='resetcaptain@example.com',
            password='strong-pass-123',
            is_active=True,
        )
        self.client = Client(enforce_csrf_checks=True)
        csrf_response = self.client.get('/api/users/csrf/')
        self.csrf_token = csrf_response.cookies['csrftoken'].value

    def test_forgot_password_sends_email_for_active_user(self):
        response = self.client.post(
            '/api/users/forgot-password/',
            {'email': 'resetcaptain@example.com'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('/reset-password?uid=', mail.outbox[0].body)

    def test_reset_password_with_valid_token_updates_password(self):
        self.client.post(
            '/api/users/forgot-password/',
            {'email': 'resetcaptain@example.com'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        body = mail.outbox[0].body
        link = body.split('Open this link to choose a new password:\n', 1)[1].split('\n', 1)[0]

        from urllib.parse import parse_qs, urlparse
        query = parse_qs(urlparse(link).query)
        uid = query['uid'][0]
        token = query['token'][0]

        response = self.client.post(
            '/api/users/reset-password/',
            {'uid': uid, 'token': token, 'new_password': 'new-strong-pass-456'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('new-strong-pass-456'))

    def test_change_password_requires_current_password_and_clears_refresh_cookie(self):
        login_response = self.client.post(
            '/api/users/login/',
            {'username': 'resetcaptain', 'password': 'strong-pass-123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )
        api_client = APIClient(enforce_csrf_checks=True)
        api_client.cookies['csrftoken'] = self.client.cookies['csrftoken'].value
        api_client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = login_response.cookies[settings.JWT_ACCESS_COOKIE_NAME].value
        api_client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = login_response.cookies[settings.JWT_REFRESH_COOKIE_NAME].value
        api_client.credentials(HTTP_X_CSRFTOKEN=self.csrf_token)

        response = api_client.post(
            '/api/users/change-password/',
            {'current_password': 'strong-pass-123', 'new_password': 'brand-new-pass-789'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('brand-new-pass-789'))
        deleted_cookie = response.cookies[settings.JWT_REFRESH_COOKIE_NAME]
        self.assertEqual(deleted_cookie.value, '')


class ProfileValidationErrorHandlingTests(TestCase):
    def test_profile_patch_requires_csrf_token(self):
        user = User.objects.create_user(username='profile-csrf-user', password='strong-pass-123')
        client = APIClient(enforce_csrf_checks=True)
        client.force_authenticate(user=user)

        response = client.patch('/api/users/me/', {'email': 'profile@example.com'}, format='multipart')

        self.assertEqual(response.status_code, 403)

    def test_profile_patch_returns_400_for_validation_errors(self):
        user = User.objects.create_user(username='profile-error-user', password='strong-pass-123')
        client = APIClient(enforce_csrf_checks=True)
        client.force_authenticate(user=user)

        client.get('/api/users/csrf/')
        csrf_token = client.cookies['csrftoken'].value
        client.credentials(HTTP_X_CSRFTOKEN=csrf_token)

        response = client.patch('/api/users/me/', {'email': 'not-an-email'}, format='multipart')

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json())


class RelationshipActionCsrfTests(TestCase):
    def test_toggle_crewmate_requires_csrf_token(self):
        actor = User.objects.create_user(username='crew-actor', password='strong-pass-123')
        target = User.objects.create_user(username='crew-target', password='strong-pass-123')
        client = APIClient(enforce_csrf_checks=True)
        client.force_authenticate(user=actor)

        response = client.post(f'/api/users/{target.id}/crew/')

        self.assertEqual(response.status_code, 403)

    def test_toggle_block_requires_csrf_token(self):
        actor = User.objects.create_user(username='block-actor', password='strong-pass-123')
        target = User.objects.create_user(username='block-target', password='strong-pass-123')
        client = APIClient(enforce_csrf_checks=True)
        client.force_authenticate(user=actor)

        response = client.post(f'/api/users/{target.id}/block/')

        self.assertEqual(response.status_code, 403)


class GoogleLoginTests(TestCase):
    def setUp(self):
        self.csrf_client = Client(enforce_csrf_checks=True)

    def _prime_csrf(self):
        response = self.csrf_client.get('/api/users/csrf/')
        self.assertEqual(response.status_code, 200)
        return response.cookies['csrftoken'].value

    @override_settings(GOOGLE_OAUTH_CLIENT_ID='test-client-id.apps.googleusercontent.com')
    def test_google_login_requires_csrf_token(self):
        response = self.csrf_client.post(
            '/api/users/google-login/',
            {'credential': 'fake-google-jwt'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)

    @override_settings(GOOGLE_OAUTH_CLIENT_ID='test-client-id.apps.googleusercontent.com')
    @patch('users.google_auth.verify_google_id_token')
    def test_google_login_creates_user_and_sets_auth_cookies(self, verify_google_id_token):
        from users.models import GoogleAccount

        verify_google_id_token.return_value = {
            'sub': 'google-user-123',
            'email': 'jens@example.com',
            'email_verified': True,
            'name': 'Jens Smaby',
            'picture': 'https://example.com/avatar.jpg',
        }

        csrf_token = self._prime_csrf()
        response = self.csrf_client.post(
            '/api/users/google-login/',
            {'credential': 'fake-google-jwt'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detail'], 'Logged in with Google.')
        self.assertTrue(response.json()['created'])
        self.assertIn(settings.JWT_ACCESS_COOKIE_NAME, response.cookies)
        self.assertIn(settings.JWT_REFRESH_COOKIE_NAME, response.cookies)

        user = User.objects.get(email='jens@example.com')
        self.assertTrue(user.is_active)
        self.assertFalse(user.has_usable_password())
        self.assertTrue(GoogleAccount.objects.filter(user=user, google_sub='google-user-123').exists())

    @override_settings(GOOGLE_OAUTH_CLIENT_ID='test-client-id.apps.googleusercontent.com')
    @patch('users.google_auth.verify_google_id_token')
    def test_google_login_links_existing_user_by_verified_email(self, verify_google_id_token):
        from users.models import GoogleAccount

        existing_user = User.objects.create_user(
            username='captainjens',
            email='jens@example.com',
            password='strong-pass-123',
            is_active=True,
        )

        verify_google_id_token.return_value = {
            'sub': 'google-user-456',
            'email': 'JENS@example.com',
            'email_verified': True,
            'name': 'Jens Smaby',
        }

        csrf_token = self._prime_csrf()
        response = self.csrf_client.post(
            '/api/users/google-login/',
            {'credential': 'fake-google-jwt'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['created'])
        self.assertEqual(User.objects.filter(email__iexact='jens@example.com').count(), 1)
        self.assertTrue(
            GoogleAccount.objects.filter(user=existing_user, google_sub='google-user-456').exists()
        )
