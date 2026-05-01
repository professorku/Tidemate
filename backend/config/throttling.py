import re

from rest_framework.throttling import AnonRateThrottle, SimpleRateThrottle, UserRateThrottle


def _parse_extended_rate(rate):
    if rate is None:
        return (None, None)

    num, period = rate.split("/", 1)
    match = re.fullmatch(
        r"(?:(\d+)\s*)?([smhd])[A-Za-z]*|(?:(\d+)\s*)?(second|minute|hour|day)s?",
        period.strip(),
        re.IGNORECASE,
    )
    if not match:
        raise ValueError(f"Invalid rate: {rate}")

    multiplier = match.group(1) or match.group(3) or 1
    unit = (match.group(2) or match.group(4) or "").lower()[0]
    duration = {"s": 1, "m": 60, "h": 3600, "d": 86400}[unit] * int(multiplier)
    return (int(num), duration)


class EndpointScopedThrottleMixin:
  
    def _get_endpoint_fragment(self, request):
        resolver_match = getattr(request, "resolver_match", None)
        if resolver_match and resolver_match.view_name:
            return resolver_match.view_name
        return request.path


class AuthAnonRateThrottle(EndpointScopedThrottleMixin, AnonRateThrottle):
    scope = "auth_anon"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            return None

        ident = self.get_ident(request)
        endpoint = self._get_endpoint_fragment(request)
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{ident}:{endpoint}",
        }


class AuthUserRateThrottle(EndpointScopedThrottleMixin, UserRateThrottle):
    scope = "auth_user"

    def get_cache_key(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return None

        ident = request.user.pk
        endpoint = self._get_endpoint_fragment(request)
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{ident}:{endpoint}",
        }


class ChatRateThrottle(UserRateThrottle):
    scope = "chat"


class ReviewRateThrottle(UserRateThrottle):
    scope = "reviews"


class WriteOnlyUserRateThrottle(UserRateThrottle):
    write_methods = {"POST", "PUT", "PATCH", "DELETE"}

    def allow_request(self, request, view):
        if request.method not in self.write_methods:
            return True
        return super().allow_request(request, view)


class BookingWriteRateThrottle(WriteOnlyUserRateThrottle):
    scope = "booking_write"


class ListingWriteRateThrottle(WriteOnlyUserRateThrottle):
    scope = "listing_write"


class ProfileWriteRateThrottle(WriteOnlyUserRateThrottle):
    scope = "profile_write"


class RelationshipWriteRateThrottle(WriteOnlyUserRateThrottle):
    scope = "relationship_write"


class ReadOnlyAnonRateThrottle(AnonRateThrottle):
    read_methods = {"GET", "HEAD", "OPTIONS"}

    def allow_request(self, request, view):
        if request.method not in self.read_methods:
            return True
        return super().allow_request(request, view)


class PublicListingsAnonRateThrottle(ReadOnlyAnonRateThrottle):
    scope = "public_listings_anon"


class PublicProfileAnonRateThrottle(ReadOnlyAnonRateThrottle):
    scope = "public_profile_anon"


class ReadOnlyUserRateThrottle(UserRateThrottle):
    read_methods = {"GET", "HEAD", "OPTIONS"}

    def allow_request(self, request, view):
        if request.method not in self.read_methods:
            return True
        return super().allow_request(request, view)


class ConditionsAnonRateThrottle(ReadOnlyAnonRateThrottle):
    scope = "boat_conditions_anon"


class ConditionsUserRateThrottle(ReadOnlyUserRateThrottle):
    scope = "boat_conditions_user"


class ConditionsGlobalRateThrottle(SimpleRateThrottle):
    scope = "boat_conditions_global"
    read_methods = {"GET", "HEAD", "OPTIONS"}

    def allow_request(self, request, view):
        if request.method not in self.read_methods:
            return True
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        return self.cache_format % {
            "scope": self.scope,
            "ident": "global",
        }


class GeocodingRateThrottle(UserRateThrottle):
    scope = "geocoding"


class ScopedIdentityRateThrottle(SimpleRateThrottle):
    scope = None
    user_scope = None
    anon_scope = None
    identity_field = None

    def parse_rate(self, rate):
        try:
            return _parse_extended_rate(rate)
        except ValueError:
            return super().parse_rate(rate)

    def _resolve_scope(self, request):
        return self.user_scope if request.user and request.user.is_authenticated else self.anon_scope

    def allow_request(self, request, view):
        self.scope = self._resolve_scope(request)
        if not self.scope:
            return True

        self.rate = self.get_rate()
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)

    def get_cache_key(self, request, view):
        if request.method != "POST":
            return None

        raw_identity = ""
        if self.identity_field:
            raw_identity = str(request.data.get(self.identity_field, "")).strip().lower()
        ident = self.get_ident(request)
        identity_fragment = raw_identity or "_"
        return self.cache_format % {
            "scope": self.scope,
            "ident": f"{ident}:{identity_fragment}",
        }


class LoginIdentityRateThrottle(ScopedIdentityRateThrottle):
    scope = "login_anon_identity"
    user_scope = "login_user_identity"
    anon_scope = "login_anon_identity"
    identity_field = "username"


class SignupIdentityRateThrottle(ScopedIdentityRateThrottle):
    scope = "signup_anon_identity"
    user_scope = "signup_user_identity"
    anon_scope = "signup_anon_identity"
    identity_field = "email"


class ResendVerificationIdentityRateThrottle(ScopedIdentityRateThrottle):
    scope = "resend_verification_anon_identity"
    user_scope = "resend_verification_user_identity"
    anon_scope = "resend_verification_anon_identity"
    identity_field = "email"


class VerifyEmailRateThrottle(SimpleRateThrottle):
    scope = "verify_email"

    def get_cache_key(self, request, view):
        if request.method != "POST":
            return None
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }



class ForgotPasswordIdentityRateThrottle(ScopedIdentityRateThrottle):
    scope = "forgot_password_anon_identity"
    user_scope = "forgot_password_user_identity"
    anon_scope = "forgot_password_anon_identity"
    identity_field = "email"


class ResetPasswordRateThrottle(SimpleRateThrottle):
    scope = "reset_password"

    def get_cache_key(self, request, view):
        if request.method != "POST":
            return None
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }


class ChangePasswordRateThrottle(UserRateThrottle):
    scope = "change_password"


class EndpointScopedIpRateThrottle(EndpointScopedThrottleMixin, AnonRateThrottle):
    scope = None

    def parse_rate(self, rate):
        try:
            return _parse_extended_rate(rate)
        except ValueError:
            return super().parse_rate(rate)


class LoginIpRateThrottle(EndpointScopedIpRateThrottle):
    scope = "login_ip"


class SignupIpRateThrottle(EndpointScopedIpRateThrottle):
    scope = "signup_ip"


class ResendVerificationIpRateThrottle(EndpointScopedIpRateThrottle):
    scope = "resend_verification_ip"


class ForgotPasswordIpRateThrottle(EndpointScopedIpRateThrottle):
    scope = "forgot_password_ip"
