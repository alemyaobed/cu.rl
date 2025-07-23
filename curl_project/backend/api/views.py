from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .permissions import IsFreeUser, IsAdminOrReadOnly
from .models import URL, Click, Country, Browser, Platform, Device, User
from .serializers import (
    URLSerializer,
    ClickSerializer,
    CountrySerializer,
    BrowserSerializer,
    PlatformSerializer,
    DeviceSerializer,
    UserSerializer,
)
from .utils import (
    generate_unique_slug,
    get_ip_address,
    get_geolocation,
    get_browser,
    get_device,
    get_platform,
)
from guest_user.decorators import allow_guest_user
from django.utils.decorators import method_decorator
from logging import getLogger
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken


logger = getLogger(__name__)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({"status": "ok"})


@method_decorator(allow_guest_user, name="dispatch")
class GuestTokenView(APIView):
    """
    Generates a JWT for a guest user.
    If the user is not authenticated, a new guest user is created.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        logger.info(f'Guest user available with UUID: {user.uuid}')
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class URLCreateView(APIView):
    """
    Create a new shortened URL.
    """

    def post(self, request, *args, **kwargs):
        original_url = request.data.get("original_url")
        if not original_url:
            return Response(
                {"error": "original_url is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slug = generate_unique_slug()
        owner = request.user if request.user.is_authenticated else None

        url_instance = URL.objects.create(
            original_url=original_url,
            shortened_slug=slug,
            owner=owner,
        )
        serializer = URLSerializer(url_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class URLRedirectView(APIView):
    """
    Redirect to the original URL and record the click.
    """

    def get(self, request, slug, *args, **kwargs):
        url_instance = get_object_or_404(URL, shortened_slug=slug)

        try:
            ip_address = get_ip_address(request)
            country_name = get_geolocation(ip_address)
        except Exception as e:
            logger.error(f'Error getting geolocation data for IP: {ip_address}, error: {e}')
            country_name = "Unknown"

        browser_name = get_browser(request)
        device_type = get_device(request)
        platform_name = get_platform(request)

        country, _ = Country.objects.get_or_create(country_name=country_name)
        browser, _ = Browser.objects.get_or_create(browser_name=browser_name)
        device, _ = Device.objects.get_or_create(device_type=device_type)
        platform, _ = Platform.objects.get_or_create(platform_name=platform_name)

        click = Click.objects.create(
            url=url_instance,
            owner=url_instance.owner,
            ip_address=ip_address,
            country=country,
            browser=browser,
            device=device,
            platform=platform,
        )

        if not url_instance.is_accessible:
            logger.warning(f'URL redirection failed for slug: {slug} (URL not accessible)')
            return Response(
                {"error": "This URL is not active or has expired."},
                status=status.HTTP_404_NOT_FOUND,
            )

        click.redirected = True
        click.save()
        logger.info(f'URL redirection successful for slug: {slug}')

        return HttpResponseRedirect(url_instance.original_url)


class UserURLListView(generics.ListAPIView):
    """
    List all URLs for the authenticated user.
    """

    serializer_class = URLSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return URL.objects.none()
        return URL.objects.filter(owner=self.request.user)


class UserURLDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a URL instance.
    """

    serializer_class = URLSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return URL.objects.none()
        return URL.objects.filter(owner=self.request.user)


class UserListView(generics.ListAPIView):
    """
    List all users.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class ClickListView(generics.ListAPIView):
    queryset = Click.objects.all()
    serializer_class = ClickSerializer
    permission_classes = [IsAdminOrReadOnly]


class ClickDetailView(generics.RetrieveAPIView):
    queryset = Click.objects.all()
    serializer_class = ClickSerializer
    permission_classes = [IsAdminOrReadOnly]


class CountryListView(generics.ListAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAdminOrReadOnly]


class CountryDetailView(generics.RetrieveAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAdminOrReadOnly]


class BrowserListView(generics.ListAPIView):
    queryset = Browser.objects.all()
    serializer_class = BrowserSerializer
    permission_classes = [IsAdminOrReadOnly]


class BrowserDetailView(generics.RetrieveAPIView):
    queryset = Browser.objects.all()
    serializer_class = BrowserSerializer
    permission_classes = [IsAdminOrReadOnly]


class PlatformListView(generics.ListAPIView):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer
    permission_classes = [IsAdminOrReadOnly]


class PlatformDetailView(generics.RetrieveAPIView):
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer
    permission_classes = [IsAdminOrReadOnly]


class DeviceListView(generics.ListAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAdminOrReadOnly]


class DeviceDetailView(generics.RetrieveAPIView):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAdminOrReadOnly]


class URLAnalyticsView(APIView):
    permission_classes = [IsFreeUser]

    def get(self, request, url_id, *args, **kwargs):
        if getattr(self, "swagger_fake_view", False):
            return Response(data={})
        url_instance = get_object_or_404(URL, uuid=url_id, owner=request.user)
        clicks = Click.objects.filter(url=url_instance)

        # Aggregate data
        total_clicks = clicks.count()
        successful_redirects = clicks.filter(redirected=True).count()
        failed_redirects = total_clicks - successful_redirects

        countries = clicks.values("country__country_name").distinct()
        browsers = clicks.values("browser__browser_name").distinct()
        platforms = clicks.values("platform__platform_name").distinct()
        devices = clicks.values("device__device_type").distinct()

        return Response(
            {
                "total_clicks": total_clicks,
                "successful_redirects": successful_redirects,
                "failed_redirects": failed_redirects,
                "countries": [c["country__country_name"] for c in countries],
                "browsers": [b["browser__browser_name"] for b in browsers],
                "platforms": [p["platform__platform_name"] for p in platforms],
                "devices": [d["device__device_type"] for d in devices],
            }
        )
