from django.urls import path

from .views import (
    change_password,
    csrf_token,
    forgot_password,
    health_check,
    login,
    logout,
    me,
    public_profile,
    refresh_token,
    resend_verification_email,
    reset_password,
    signup,
    toggle_block_user,
    toggle_crewmate,
    verify_email,
)

urlpatterns = [
    path("health/", health_check),
    path("csrf/", csrf_token),
    path("signup/", signup),
    path("login/", login, name="token_obtain_pair"),
    path("refresh/", refresh_token, name="token_refresh"),
    path("forgot-password/", forgot_password),
    path("reset-password/", reset_password),
    path("change-password/", change_password),
    path("verify-email/", verify_email),
    path("resend-verification/", resend_verification_email),
    path("logout/", logout, name="token_logout"),
    path("me/", me),
    path("<int:user_id>/crew/", toggle_crewmate),
    path("<int:user_id>/block/", toggle_block_user),
    path("<int:user_id>/", public_profile),
]
