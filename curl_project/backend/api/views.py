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
    normalize_url,
)
from guest_user.decorators import allow_guest_user
from django.utils.decorators import method_decorator
from logging import getLogger
from django.http import HttpResponseRedirect
from rest_framework_simplejwt.tokens import RefreshToken
from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.conf import settings
from datetime import timedelta


logger = getLogger(__name__)


class CustomLoginView(LoginView):
    def post(self, request, *args, **kwargs):
        logger.info("="*50)
        logger.info(f"LOGIN ATTEMPT - Username: {request.data.get('username')}")
        logger.info(f"Cookies present: {list(request.COOKIES.keys())}")
        logger.info("="*50)

        # Authenticate the user using dj-rest-auth's serializer
        self.request = request
        self.serializer = self.get_serializer(data=self.request.data)
        self.serializer.is_valid(raise_exception=True)

        # Handle guest user logic before login - read from HTTP-only cookies
        guest_user = None
        try:
            jwt_auth = JWTAuthentication()
            access_token = request.COOKIES.get('access_token')
            logger.info(f"Access token from cookie: {'Present' if access_token else 'Not found'}")
            
            if access_token:
                logger.info(f"Token preview: {access_token[:20]}...")
                validated_token = jwt_auth.get_validated_token(access_token)
                user_id = validated_token["user_id"]
                logger.info(f"Extracted user_id from token: {user_id}")
                
                guest_user = User.objects.get(uuid=user_id, user_type="guest")
                logger.info(f"✓ GUEST USER FOUND: {guest_user.uuid} (username: {guest_user.username})")
                guest_url_count = URL.objects.filter(owner=guest_user).count()
                logger.info(f"✓ Guest has {guest_url_count} URLs to migrate")
            else:
                logger.info("No access_token cookie found - user is not a guest")
        except InvalidToken as e:
            logger.warning(f"Invalid token in cookie: {e}")
        except User.DoesNotExist:
            logger.info(f"User {user_id} exists but is not a guest (user_type != 'guest')")
        except Exception as e:
            logger.error(f"Unexpected error checking for guest user: {type(e).__name__}: {e}")

        self.login()  # This sets self.user
        user = self.user
        logger.info(f"✓ User {user.username} (UUID: {user.uuid}) successfully authenticated")

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
            logger.info(f"Checking migration: guest={guest_user.uuid}, logged_in={user.uuid}")
            if guest_user.uuid != user.uuid:
                logger.info(f"🔄 STARTING URL MIGRATION: guest {guest_user.uuid} → user {user.uuid}")
                guest_urls = URL.objects.filter(owner=guest_user)
                migrated_count = 0
                merged_count = 0
                
                for guest_url in guest_urls:
                    existing_url = URL.objects.filter(
                        original_url=guest_url.original_url, owner=user
                    ).first()
                    if existing_url:
                        # Merge clicks
                        click_count = Click.objects.filter(url=guest_url).count()
                        Click.objects.filter(url=guest_url).update(url=existing_url)
                        logger.info(f"  ✓ Merged {click_count} clicks: {guest_url.shortened_slug} → {existing_url.shortened_slug}")
                        guest_url.delete()
                        merged_count += 1
                    else:
                        # Just transfer ownership
                        guest_url.owner = user
                        guest_url.save()
                        logger.info(f"  ✓ Transferred URL: {guest_url.shortened_slug} to {user.username}")
                        migrated_count += 1
                
                guest_user.delete()
                logger.info(f"✅ MIGRATION COMPLETE: {migrated_count} transferred, {merged_count} merged")
                logger.info(f"✅ Guest user {guest_user.uuid} deleted")
            else:
                logger.warning(f"Guest user and logged-in user are the same: {user.uuid}")
        else:
            if not guest_user:
                logger.info("No guest user to migrate (guest_user is None)")
            if not user:
                logger.error("Logged-in user is None!")

        logger.info("="*50)
        logger.info("LOGIN COMPLETE")
        logger.info("="*50)
        
        # Create response and set cookies
        response = Response(response_data, status=status.HTTP_200_OK)
        
        # Get cookie settings from REST_AUTH config
        rest_auth_config = getattr(settings, 'REST_AUTH', {})
        cookie_secure = rest_auth_config.get('JWT_AUTH_SECURE', True)
        cookie_samesite = rest_auth_config.get('JWT_AUTH_SAMESITE', 'None')
        access_cookie_name = rest_auth_config.get('JWT_AUTH_COOKIE', 'access_token')
        refresh_cookie_name = rest_auth_config.get('JWT_AUTH_REFRESH_COOKIE', 'refresh_token')
        
        # Set access token cookie
        response.set_cookie(
            key=access_cookie_name,
            value=access_token,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            max_age=int(timedelta(minutes=5).total_seconds()),
        )
        
        # Set refresh token cookie
        response.set_cookie(
            key=refresh_cookie_name,
            value=refresh_token,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            max_age=int(timedelta(days=1).total_seconds()),
        )
        
        logger.info(f"✓ Login cookies set for user {user.uuid}")
        
        return response


class CustomRegisterView(RegisterView):
    def create(self, request, *args, **kwargs):
        logger.info("="*50)
        logger.info(f"REGISTRATION ATTEMPT - Username: {request.data.get('username')}")
        logger.info(f"Cookies present: {list(request.COOKIES.keys())}")
        logger.info("="*50)
        
        # Try to get guest user from cookies before registration
        guest_user = None
        try:
            jwt_auth = JWTAuthentication()
            access_token = request.COOKIES.get('access_token')
            logger.info(f"Access token from cookie: {'Present' if access_token else 'Not found'}")
            
            if access_token:
                logger.info(f"Token preview: {access_token[:20]}...")
                validated_token = jwt_auth.get_validated_token(access_token)
                user_id = validated_token["user_id"]
                logger.info(f"Extracted user_id from token: {user_id}")
                
                guest_user = User.objects.get(uuid=user_id, user_type="guest")
                logger.info(f"✓ GUEST USER FOUND: {guest_user.uuid} (username: {guest_user.username})")
                guest_url_count = URL.objects.filter(owner=guest_user).count()
                logger.info(f"✓ Guest has {guest_url_count} URLs to migrate")
            else:
                logger.info("No access_token cookie found - user is not a guest")
        except InvalidToken as e:
            logger.warning(f"Invalid token in cookie: {e}")
        except User.DoesNotExist:
            logger.info(f"User {user_id} exists but is not a guest (user_type != 'guest')")
        except Exception as e:
            logger.error(f"Unexpected error checking for guest user: {type(e).__name__}: {e}")
        
        # Call parent registration logic
        response = super().create(request, *args, **kwargs)
        
        # Get the newly created user from the response
        if response.status_code == 201 or response.status_code == 200:
            logger.info(f"✓ Registration successful (status {response.status_code})")
            # Try to get the user that was just created
            username = request.data.get('username')
            try:
                new_user = User.objects.get(username=username)
                logger.info(f"✓ New user retrieved: {new_user.username} (UUID: {new_user.uuid})")
                
                # Transfer URLs from guest to newly registered user
                if guest_user and guest_user.uuid != new_user.uuid:
                    logger.info(f"🔄 STARTING URL MIGRATION: guest {guest_user.uuid} → user {new_user.uuid}")
                    guest_urls = URL.objects.filter(owner=guest_user)
                    migrated_count = 0
                    merged_count = 0
                    
                    for guest_url in guest_urls:
                        existing_url = URL.objects.filter(
                            original_url=guest_url.original_url, owner=new_user
                        ).first()
                        if existing_url:
                            # Merge clicks
                            click_count = Click.objects.filter(url=guest_url).count()
                            Click.objects.filter(url=guest_url).update(url=existing_url)
                            logger.info(f"  ✓ Merged {click_count} clicks: {guest_url.shortened_slug} → {existing_url.shortened_slug}")
                            guest_url.delete()
                            merged_count += 1
                        else:
                            # Just transfer ownership
                            guest_url.owner = new_user
                            guest_url.save()
                            logger.info(f"  ✓ Transferred URL: {guest_url.shortened_slug} to {new_user.username}")
                            migrated_count += 1
                    
                    guest_user.delete()
                    logger.info(f"✅ MIGRATION COMPLETE: {migrated_count} transferred, {merged_count} merged")
                    logger.info(f"✅ Guest user {guest_user.uuid} deleted")
                elif guest_user:
                    logger.warning(f"Guest user and new user are the same: {new_user.uuid}")
                else:
                    logger.info("No guest user to migrate")
            except User.DoesNotExist:
                logger.error(f"❌ Could not find newly created user: {username}")
        else:
            logger.error(f"❌ Registration failed with status {response.status_code}")
        
        logger.info("="*50)
        logger.info("REGISTRATION COMPLETE")
        logger.info("="*50)
        return response


class HealthCheckView(APIView):
    tags = ["Health Check"]
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({"status": "ok"})


class CurrentUserView(APIView):
    """
    Get current authenticated user information.
    """
    tags = ["Authentication"]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        user_serializer = UserSerializer(user)
        return Response({"user": user_serializer.data}, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """
    Delete the authenticated user's account and all associated data.
    """
    tags = ["Authentication"]
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user = request.user
        
        # Prevent guest users from deleting (they auto-delete anyway)
        if user.user_type == "guest":
            return Response(
                {"error": "Guest users cannot manually delete their account"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent superusers from accidentally deleting via API
        if user.is_superuser:
            return Response(
                {"error": "Admin accounts must be deleted through Django admin"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        username = user.username
        logger.info(f"User {username} ({user.uuid}) requested account deletion")
        
        # Django will cascade delete all related objects (URLs, Clicks, Profile)
        user.delete()
        logger.info(f"User {username} account successfully deleted")
        
        return Response(
            {"message": "Account successfully deleted"},
            status=status.HTTP_200_OK
        )


@method_decorator(allow_guest_user, name="dispatch")
class GuestTokenView(APIView):
    """
    Generates a JWT for a guest user.
    If the user is not authenticated, a new guest user is created.
    """

    tags = ["Authentication"]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        from django.conf import settings
        from datetime import timedelta
        
        user = request.user
        logger.info(f"Guest user available with UUID: {user.uuid}")
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)

        response_data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user_serializer.data,
        }
        
        response = Response(response_data, status=status.HTTP_200_OK)
        
        # Set tokens as HTTP-only cookies (matching login behavior)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Get cookie settings from REST_AUTH config
        rest_auth_config = getattr(settings, 'REST_AUTH', {})
        cookie_secure = rest_auth_config.get('JWT_AUTH_SECURE', True)
        cookie_samesite = rest_auth_config.get('JWT_AUTH_SAMESITE', 'None')
        access_cookie_name = rest_auth_config.get('JWT_AUTH_COOKIE', 'access_token')
        refresh_cookie_name = rest_auth_config.get('JWT_AUTH_REFRESH_COOKIE', 'refresh_token')
        
        # Set access token cookie
        response.set_cookie(
            key=access_cookie_name,
            value=access_token,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            max_age=int(timedelta(minutes=5).total_seconds()),  # 5 minutes for access token
        )
        
        # Set refresh token cookie
        response.set_cookie(
            key=refresh_cookie_name,
            value=refresh_token,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            max_age=int(timedelta(days=1).total_seconds()),  # 1 day for refresh token
        )
        
        logger.info(f"✓ Guest tokens set as HTTP-only cookies for user {user.uuid}")
        
        return response


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
        # Ensure scheme is present for consistency and correct redirection behavior
        original_url = normalize_url(original_url)

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

        return Response({"original_url": normalize_url(url_instance.original_url)})




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
