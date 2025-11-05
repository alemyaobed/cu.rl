from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.views import CustomLoginView, CustomRegisterView
from dj_rest_auth.views import PasswordResetConfirmView

schema_view = get_schema_view(
    openapi.Info(
        title="CU.RL API",
        default_version="v1",
        description="Your ultimate URL shortener...",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@snippets.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

api_prefix = "api/v1"

auth_urls = [
    path("login/", CustomLoginView.as_view(), name="rest_login"),
    path("registration/", CustomRegisterView.as_view(), name="rest_register"),
    path("password/reset/confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("", include("dj_rest_auth.urls")),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path(f"{api_prefix}/swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    path(f"{api_prefix}/redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path(f"{api_prefix}/auth/", include(auth_urls)),
    path(f"{api_prefix}/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
