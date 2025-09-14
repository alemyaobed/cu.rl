from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .permissions import IsFreeUser, IsAdminOrReadOnly
from .models import URL, Click, Country, Browser, Device, Platform, User
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
from dj_rest_auth.views import LoginView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


logger = getLogger(__name__)


class CustomLoginView(LoginView):
    def post(self, request, *args, **kwargs):
        logger.info(f"Login attempt for user: {request.data.get('username')}")

        # Authenticate the user using dj-rest-auth's serializer
        self.request = request
        self.serializer = self.get_serializer(data=self.request.data)
        self.serializer.is_valid(raise_exception=True)

        # Handle guest user logic before login
        guest_user = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user_id = validated_token["user_id"]
                guest_user = User.objects.get(uuid=user_id, user_type="guest")
                logger.info(f"Guest user {guest_user.uuid} found, preparing to migrate data.")
            except (InvalidToken, User.DoesNotExist):
                logger.debug("No valid guest user found from token.")
                pass  # Token is invalid or user is not a guest

        self.login()  # This sets self.user
        user = self.user
        logger.info(f"User {user.username} successfully logged in.")

        # Now, manually create the response with tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response_data = {
            "user": UserSerializer(user).data,
            "access": access_token,
            "refresh": refresh_token,
        }

        # Transfer URLs from guest to newly logged-in user
        if guest_user and user:
            if guest_user.uuid != user.uuid:
                logger.info(f"Starting data migration from guest {guest_user.uuid} to user {user.uuid}")
                guest_urls = URL.objects.filter(owner=guest_user)
                for guest_url in guest_urls:
                    existing_url = URL.objects.filter(
                        original_url=guest_url.original_url, owner=user
                    ).first()
                    if existing_url:
                        # Merge clicks
                        Click.objects.filter(url=guest_url).update(url=existing_url)
                        logger.debug(f"Merging clicks from guest URL {guest_url.shortened_slug} to existing URL {existing_url.shortened_slug}")
                        # Delete guest url
                        guest_url.delete()
                    else:
                        # Just transfer ownership
                        guest_url.owner = user
                        guest_url.save()
                        logger.debug(f"Transferred ownership of URL {guest_url.shortened_slug} to user {user.username}")
                guest_user.delete()
                logger.info(f"Guest user {guest_user.uuid} deleted after data migration.")

        return Response(response_data, status=status.HTTP_200_OK)


class HealthCheckView(APIView):
    tags = ["Health Check"]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({"status": "ok"})


@method_decorator(allow_guest_user, name="dispatch")
class GuestTokenView(APIView):
    """
    Generates a JWT for a guest user.
    If the user is not authenticated, a new guest user is created.
    """

    tags = ["Authentication"]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        logger.info(f"Guest user available with UUID: {user.uuid}")
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

    tags = ["URLs"]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        original_url = request.data.get("original_url")
        if not original_url:
            return Response(
                {"error": "original_url is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        owner = request.user if request.user.is_authenticated else None
        customized = False
        slug = request.data.get("shortened_slug")

        if slug:
            #  Guests cannot create custom URLs
            if owner and owner.user_type == "guest":
                return Response(
                    {"error": "Guests cannot create custom URLs"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if URL.objects.filter(shortened_slug=slug).exists():
                return Response(
                    {"error": "This slug is already in use"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            customized = True
        else:
            slug = generate_unique_slug()

        # Check if the URL already exists for the user
        existing_url = URL.objects.filter(
            original_url=original_url, owner=owner
        ).first()
        if existing_url:
            serializer = URLSerializer(existing_url)
            return Response(serializer.data, status=status.HTTP_200_OK)

        url_instance = URL.objects.create(
            original_url=original_url,
            shortened_slug=slug,
            owner=owner,
            customized=customized,
        )
        serializer = URLSerializer(url_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class URLRedirectView(APIView):
    """
    Retrieve the original URL for a given slug and record the click.
    """

    tags = ["URLs"]
    permission_classes = [AllowAny]

    def get(self, request, slug, *args, **kwargs):
        url_instance = get_object_or_404(URL, shortened_slug=slug)

        try:
            ip_address = get_ip_address(request)
            country_name = get_geolocation(ip_address) or "Unknown"
        except Exception as e:
            logger.error(
                f"Error getting geolocation data for IP: {ip_address}, error: {e}"
            )
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
            logger.warning(
                f"URL redirection failed for slug: {slug} (URL not accessible)"
            )
            return Response(
                {"error": "This URL is not active or has expired."},
                status=status.HTTP_404_NOT_FOUND,
            )

        click.redirected = True
        click.save()
        logger.info(f"URL redirection successful for slug: {slug}")

        return Response({"original_url": url_instance.original_url})


class UserURLListView(generics.ListAPIView):
    """
    List all URLs for the authenticated user.
    """

    tags = ["User URLs"]
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

    tags = ["User URLs"]
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

    tags = ["Users"]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class ClickListView(generics.ListAPIView):
    tags = ["Analytics"]
    queryset = Click.objects.all()
    serializer_class = ClickSerializer
    permission_classes = [IsAdminOrReadOnly]


class ClickDetailView(generics.RetrieveAPIView):
    tags = ["Analytics"]
    queryset = Click.objects.all()
    serializer_class = ClickSerializer
    permission_classes = [IsAdminOrReadOnly]


class CountryListView(generics.ListAPIView):
    tags = ["Analytics"]
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAdminOrReadOnly]


class CountryDetailView(generics.RetrieveAPIView):
    tags = ["Analytics"]
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAdminOrReadOnly]


class BrowserListView(generics.ListAPIView):
    tags = ["Analytics"]
    queryset = Browser.objects.all()
    serializer_class = BrowserSerializer
    permission_classes = [IsAdminOrReadOnly]


class BrowserDetailView(generics.RetrieveAPIView):
    tags = ["Analytics"]
    queryset = Browser.objects.all()
    serializer_class = BrowserSerializer
    permission_classes = [IsAdminOrReadOnly]


class PlatformListView(generics.ListAPIView):
    tags = ["Analytics"]
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer
    permission_classes = [IsAdminOrReadOnly]


class PlatformDetailView(generics.RetrieveAPIView):
    tags = ["Analytics"]
    queryset = Platform.objects.all()
    serializer_class = PlatformSerializer
    permission_classes = [IsAdminOrReadOnly]


class DeviceListView(generics.ListAPIView):
    tags = ["Analytics"]
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAdminOrReadOnly]


class DeviceDetailView(generics.RetrieveAPIView):
    tags = ["Analytics"]
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [IsAdminOrReadOnly]


class URLAnalyticsView(APIView):
    tags = ["Analytics"]
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
