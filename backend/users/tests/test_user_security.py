from django.conf import settings
from django.contrib.auth.models import User
from django.core import mail
from django.test import Client, TestCase, override_settings
from rest_framework.test import APIClient


class PublicProfileSecurityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='public-profile-user',
            email='private-email@example.com',
            password='strong-pass-123',
            is_active=True,
        )
        self.user.profile.bio = 'Public bio.'
        self.user.profile.location = 'Mo i Rana'
        self.user.profile.save()

    def test_public_profile_does_not_expose_email_or_private_stats(self):
        response = Client().get(f'/api/users/{self.user.id}/')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertNotIn('email', payload)
        self.assertNotIn('pending_email', payload)
        self.assertNotIn('email_change_pending', payload)
        self.assertEqual(payload['username'], 'public-profile-user')
        self.assertEqual(set(payload['stats'].keys()), {'boats_listed'})


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class ProfileEmailChangeSecurityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='email-change-user',
            email='old@example.com',
            password='strong-pass-123',
            is_active=True,
        )
        self.other_user = User.objects.create_user(
            username='other-email-user',
            email='taken@example.com',
            password='strong-pass-123',
            is_active=True,
        )
        self.client = APIClient(enforce_csrf_checks=True)
        csrf_response = Client(enforce_csrf_checks=True).get('/api/users/csrf/')
        self.csrf_token = csrf_response.cookies['csrftoken'].value
        self.client.cookies['csrftoken'] = self.csrf_token
        self.client.force_authenticate(user=self.user)
        self.client.credentials(HTTP_X_CSRFTOKEN=self.csrf_token)

    def test_email_change_requires_current_password(self):
        response = self.client.patch(
            '/api/users/me/',
            {'email': 'new@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('current_password', response.json())
        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.email, 'old@example.com')
        self.assertFalse(self.user.profile.pending_email)

    def test_email_change_rejects_case_insensitive_duplicate_email(self):
        response = self.client.patch(
            '/api/users/me/',
            {
                'email': 'TAKEN@example.com',
                'current_password': 'strong-pass-123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json())
        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.email, 'old@example.com')
        self.assertFalse(self.user.profile.pending_email)

    def test_email_change_sets_pending_email_without_replacing_verified_email(self):
        response = self.client.patch(
            '/api/users/me/',
            {
                'email': 'new@example.com',
                'current_password': 'strong-pass-123',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.email, 'old@example.com')
        self.assertEqual(self.user.profile.pending_email, 'new@example.com')
        self.assertTrue(self.user.profile.pending_email_requested_at)
        self.assertEqual(len(mail.outbox), 2)

    def test_profile_patch_requires_csrf_when_authenticated_by_cookie(self):
        cookie_client = Client(enforce_csrf_checks=True)
        login_csrf_response = cookie_client.get('/api/users/csrf/')
        login_csrf_token = login_csrf_response.cookies['csrftoken'].value
        login_response = cookie_client.post(
            '/api/users/login/',
            {'username': 'email-change-user', 'password': 'strong-pass-123'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=login_csrf_token,
        )
        self.assertEqual(login_response.status_code, 200)

        # Keep only the JWT access cookie. Do not send a CSRF cookie/header.
        csrf_less_client = Client(enforce_csrf_checks=True)
        csrf_less_client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = (
            login_response.cookies[settings.JWT_ACCESS_COOKIE_NAME].value
        )

        response = csrf_less_client.patch(
            '/api/users/me/',
            {'bio': 'This write should fail without CSRF.'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)