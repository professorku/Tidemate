from django.urls import path

from .views import (
    change_password,
    csrf_token,
    forgot_password,
    google_login,
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
    verify_email_change,
)

urlpatterns = [
    path("health/", health_check, name="health_check"),
    path("csrf/", csrf_token, name="csrf_token"),

    path("signup/", signup, name="signup"),
    path("login/", login, name="login"),
    path("google-login/", google_login, name="google_login"),
    path("refresh/", refresh_token, name="refresh_token"),
    path("logout/", logout, name="logout"),

    path("forgot-password/", forgot_password, name="forgot_password"),
    path("reset-password/", reset_password, name="reset_password"),
    path("change-password/", change_password, name="change_password"),

    path("verify-email/", verify_email, name="verify_email"),
    path("verify-email-change/", verify_email_change, name="verify_email_change"),
    path("resend-verification/", resend_verification_email, name="resend_verification"),
    path("resend-verification-email/", resend_verification_email, name="resend_verification_email"),

    path("me/", me, name="me"),
    path("profiles/<int:user_id>/", public_profile, name="public_profile"),

    path("crewmates/<int:user_id>/toggle/", toggle_crewmate, name="toggle_crewmate"),
    path("blocks/<int:user_id>/toggle/", toggle_block_user, name="toggle_block_user"),
    path("crewmates/<int:user_id>/", toggle_crewmate, name="toggle_crewmate_legacy"),
    path("blocks/<int:user_id>/", toggle_block_user, name="toggle_block_user_legacy"),
]
