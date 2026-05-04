import re
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.contrib.auth.models import User
from django.core import mail
from django.db import IntegrityError, transaction
from django.test import Client, TestCase, override_settings
from rest_framework.test import APIClient


def get_csrf_client():
    client = Client(enforce_csrf_checks=True)
    response = client.get("/api/users/csrf/")
    assert response.status_code == 200
    csrf_token = response.cookies["csrftoken"].value
    return client, csrf_token


def extract_query_value_from_email(pattern, query_key):
    for message in reversed(mail.outbox):
        match = re.search(pattern, message.body)
        if not match:
            continue

        url = match.group(0)
        query = parse_qs(urlparse(url).query)
        return query[query_key][0]

    raise AssertionError(f"Could not find {query_key} in email outbox.")


def extract_email_change_token():
    return extract_query_value_from_email(
        r"http[^\s]+/verify-email-change\?token=[^\s]+",
        "token",
    )


def extract_password_reset_uid_and_token():
    uid = extract_query_value_from_email(
        r"http[^\s]+/reset-password\?uid=[^\s]+",
        "uid",
    )
    token = extract_query_value_from_email(
        r"http[^\s]+/reset-password\?uid=[^\s]+",
        "token",
    )
    return uid, token


class EmailUniquenessDatabaseTests(TestCase):
    def test_database_rejects_case_insensitive_duplicate_user_emails(self):
        User.objects.create_user(
            username="captain-one",
            email="Captain@Example.com",
            password="strong-pass-123",
            is_active=True,
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                User.objects.create_user(
                    username="captain-two",
                    email="captain@example.com",
                    password="strong-pass-123",
                    is_active=True,
                )

    def test_database_rejects_case_insensitive_duplicate_pending_emails(self):
        user_one = User.objects.create_user(
            username="pending-one",
            email="pending-one@example.com",
            password="strong-pass-123",
            is_active=True,
        )
        user_two = User.objects.create_user(
            username="pending-two",
            email="pending-two@example.com",
            password="strong-pass-123",
            is_active=True,
        )

        user_one.profile.pending_email = "NewEmail@Example.com"
        user_one.profile.save(update_fields=["pending_email"])

        user_two.profile.pending_email = "newemail@example.com"

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                user_two.profile.save(update_fields=["pending_email"])
    
    def test_database_rejects_case_insensitive_duplicate_usernames(self):
        User.objects.create_user(
            username="CaptainJens",
            email="captain-jens@example.com",
            password="strong-pass-123",
            is_active=True,
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                User.objects.create_user(
                    username="captainjens",
                    email="captain-jens-two@example.com",
                    password="strong-pass-123",
                    is_active=True,
                )


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class SignupEmailSecurityTests(TestCase):
    def setUp(self):
        self.client, self.csrf_token = get_csrf_client()

    def post_signup(self, payload, *, csrf=True):
        kwargs = {
            "content_type": "application/json",
        }

        if csrf:
            kwargs["HTTP_X_CSRFTOKEN"] = self.csrf_token

        return self.client.post("/api/users/signup/", payload, **kwargs)

    def test_signup_requires_csrf_token(self):
        response = self.post_signup(
            {
                "username": "csrf-user",
                "email": "csrf-user@example.com",
                "password": "strong-pass-123",
            },
            csrf=False,
        )

        self.assertEqual(response.status_code, 403)

    def test_signup_normalizes_email_and_creates_inactive_user(self):
        response = self.post_signup(
            {
                "username": "newcaptain",
                "email": "  NewCaptain@Example.COM  ",
                "password": "strong-pass-123",
            },
        )

        self.assertEqual(response.status_code, 201)

        user = User.objects.get(username="newcaptain")
        self.assertEqual(user.email, "newcaptain@example.com")
        self.assertFalse(user.is_active)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("/verify-email?token=", mail.outbox[0].body)

    def test_signup_rejects_case_insensitive_duplicate_email(self):
        User.objects.create_user(
            username="existing-user",
            email="Taken@Example.com",
            password="strong-pass-123",
            is_active=True,
        )

        response = self.post_signup(
            {
                "username": "duplicate-user",
                "email": "taken@example.com",
                "password": "strong-pass-123",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

    def test_unverified_user_cannot_login_and_gets_generic_error(self):
        User.objects.create_user(
            username="unverified-user",
            email="unverified@example.com",
            password="strong-pass-123",
            is_active=False,
        )

        response = self.client.post(
            "/api/users/login/",
            {
                "username": "unverified-user",
                "password": "strong-pass-123",
            },
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid username or password.")
        self.assertNotIn(settings.JWT_ACCESS_COOKIE_NAME, response.cookies)
        self.assertNotIn(settings.JWT_REFRESH_COOKIE_NAME, response.cookies)


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class EmailChangeSecurityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="email-change-user",
            email="old@example.com",
            password="strong-pass-123",
            is_active=True,
        )

        self.api_client = APIClient(enforce_csrf_checks=True)

        csrf_client, csrf_token = get_csrf_client()
        self.csrf_token = csrf_token
        self.api_client.cookies["csrftoken"] = csrf_client.cookies["csrftoken"].value
        self.api_client.force_authenticate(user=self.user)
        self.api_client.credentials(HTTP_X_CSRFTOKEN=self.csrf_token)

    def patch_me(self, payload):
        return self.api_client.patch(
            "/api/users/me/",
            payload,
            format="json",
        )

    def test_email_change_requires_current_password(self):
        response = self.patch_me(
            {
                "email": "new@example.com",
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("current_password", response.json())

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.email, "old@example.com")
        self.assertFalse(self.user.profile.pending_email)

    def test_email_change_rejects_existing_user_email_case_insensitively(self):
        User.objects.create_user(
            username="taken-email-user",
            email="Taken@Example.com",
            password="strong-pass-123",
            is_active=True,
        )

        response = self.patch_me(
            {
                "email": "taken@example.com",
                "current_password": "strong-pass-123",
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

    def test_email_change_rejects_duplicate_pending_email_case_insensitively(self):
        other_user = User.objects.create_user(
            username="other-pending-user",
            email="other@example.com",
            password="strong-pass-123",
            is_active=True,
        )
        other_user.profile.pending_email = "Pending@Example.com"
        other_user.profile.save(update_fields=["pending_email"])

        response = self.patch_me(
            {
                "email": "pending@example.com",
                "current_password": "strong-pass-123",
            }
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.json())

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()
        self.assertEqual(self.user.email, "old@example.com")
        self.assertFalse(self.user.profile.pending_email)

    def test_email_change_sets_pending_email_without_replacing_verified_email(self):
        response = self.patch_me(
            {
                "email": "New@Example.com",
                "current_password": "strong-pass-123",
            }
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()

        self.assertEqual(self.user.email, "old@example.com")
        self.assertEqual(self.user.profile.pending_email, "new@example.com")
        self.assertTrue(self.user.profile.pending_email_requested_at)
        self.assertEqual(len(mail.outbox), 2)

    def test_email_change_verification_updates_email_and_clears_pending_email(self):
        self.patch_me(
            {
                "email": "verified-new@example.com",
                "current_password": "strong-pass-123",
            }
        )

        token = extract_email_change_token()

        verify_client, csrf_token = get_csrf_client()
        response = verify_client.post(
            "/api/users/verify-email-change/",
            {"token": token},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()

        self.assertEqual(self.user.email, "verified-new@example.com")
        self.assertIsNone(self.user.profile.pending_email)
        self.assertIsNone(self.user.profile.pending_email_requested_at)

    def test_email_change_verification_fails_if_email_was_taken_after_request(self):
        self.patch_me(
            {
                "email": "race@example.com",
                "current_password": "strong-pass-123",
            }
        )

        token = extract_email_change_token()

        User.objects.create_user(
            username="race-winner",
            email="race@example.com",
            password="strong-pass-123",
            is_active=True,
        )

        verify_client, csrf_token = get_csrf_client()
        response = verify_client.post(
            "/api/users/verify-email-change/",
            {"token": token},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["detail"],
            "Verification link is invalid or no longer valid.",
        )

        self.user.refresh_from_db()
        self.user.profile.refresh_from_db()

        self.assertEqual(self.user.email, "old@example.com")
        self.assertEqual(self.user.profile.pending_email, "race@example.com")


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class PasswordResetSecurityTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="reset-user",
            email="reset@example.com",
            password="strong-pass-123",
            is_active=True,
        )
        self.client, self.csrf_token = get_csrf_client()

    def test_forgot_password_is_generic_for_unknown_email_and_sends_no_email(self):
        response = self.client.post(
            "/api/users/forgot-password/",
            {"email": "missing@example.com"},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()["detail"],
            "If an account exists for that email, a password reset link has been sent.",
        )
        self.assertEqual(len(mail.outbox), 0)

    def test_forgot_password_does_not_send_email_for_unverified_user(self):
        User.objects.create_user(
            username="inactive-reset-user",
            email="inactive-reset@example.com",
            password="strong-pass-123",
            is_active=False,
        )

        response = self.client.post(
            "/api/users/forgot-password/",
            {"email": "inactive-reset@example.com"},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_revokes_existing_refresh_session(self):
        login_response = self.client.post(
            "/api/users/login/",
            {
                "username": "reset-user",
                "password": "strong-pass-123",
            },
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(login_response.status_code, 200)
        old_refresh_token = login_response.cookies[settings.JWT_REFRESH_COOKIE_NAME].value

        self.client.post(
            "/api/users/forgot-password/",
            {"email": "reset@example.com"},
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        uid, token = extract_password_reset_uid_and_token()

        reset_response = self.client.post(
            "/api/users/reset-password/",
            {
                "uid": uid,
                "token": token,
                "new_password": "new-strong-pass-456",
            },
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(reset_response.status_code, 200)

        self.client.cookies[settings.JWT_REFRESH_COOKIE_NAME] = old_refresh_token

        refresh_response = self.client.post(
            "/api/users/refresh/",
            content_type="application/json",
            HTTP_X_CSRFTOKEN=self.csrf_token,
        )

        self.assertEqual(refresh_response.status_code, 401)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("new-strong-pass-456"))