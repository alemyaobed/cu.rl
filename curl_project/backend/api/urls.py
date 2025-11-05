from django.urls import path, include

from .views import (
    UserListView,
    URLCreateView,
    URLRedirectView,
    UserURLListView,
    UserURLDetailView,
    ClickListView,
    ClickDetailView,
    CountryListView,
    CountryDetailView,
    BrowserListView,
    BrowserDetailView,
    PlatformListView,
    PlatformDetailView,
    DeviceListView,
    DeviceDetailView,
    URLAnalyticsView,
    HealthCheckView,
    GuestTokenView,
    CurrentUserView,
    DeleteAccountView,
)

auth_urls = [
    path("guest-token/", GuestTokenView.as_view(), name="guest-token"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("delete-account/", DeleteAccountView.as_view(), name="delete-account"),
]

health_urls = [
    path("", HealthCheckView.as_view(), name="health-check"),
]

url_urls = [
    path("shorten/", URLCreateView.as_view(), name="url-create"),
    path("", UserURLListView.as_view(), name="user-url-list"),
    path("<uuid:pk>/", UserURLDetailView.as_view(), name="user-url-detail"),
    path(
        "<uuid:url_id>/analytics/",
        URLAnalyticsView.as_view(),
        name="url-analytics",
    ),
    path("<str:slug>/", URLRedirectView.as_view(), name="url-redirect"),
]

analytics_urls = [
    path("clicks/", ClickListView.as_view(), name="click-list"),
    path("clicks/<uuid:pk>/", ClickDetailView.as_view(), name="click-detail"),
    path("countries/", CountryListView.as_view(), name="country-list"),
    path(
        "countries/<uuid:pk>/",
        CountryDetailView.as_view(),
        name="country-detail",
    ),
    path("browsers/", BrowserListView.as_view(), name="browser-list"),
    path(
        "browsers/<uuid:pk>/",
        BrowserDetailView.as_view(),
        name="browser-detail",
    ),
    path("platforms/", PlatformListView.as_view(), name="platform-list"),
    path(
        "platforms/<uuid:pk>/",
        PlatformDetailView.as_view(),
        name="platform-detail",
    ),
    path("devices/", DeviceListView.as_view(), name="device-list"),
    path(
        "devices/<uuid:pk>/",
        DeviceDetailView.as_view(),
        name="device-detail",
    ),
]

user_urls = [
    path("", UserListView.as_view(), name="user-list"),
]

urlpatterns = [
    path("auth/", include(auth_urls)),
    path("health/", include(health_urls)),
    path("analytics/", include(analytics_urls)),
    path("users/", include(user_urls)),
    path("urls/", include(url_urls)),
    
]
