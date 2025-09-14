from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models.accounts import User, Profile
from .models.url_shortening import URL
from .models.analytics import Click, Browser, Device, Country, Platform
import logging

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "uuid",
            "username",
            "email",
            "user_type",
            "password",
            "is_active",
            "is_staff",
            "is_superuser",
            "last_login",
            "date_joined",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "user_type": {"read_only": True},
        }

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = [
            "user",
            "surname",
            "other_names",
            "bio",
            "birth_date",
            "profile_picture",
        ]


class URLSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)

    class Meta:
        model = URL
        fields = [
            "uuid",
            "owner",
            "original_url",
            "shortened_slug",
            "creation_date",
            "customized",
            "is_active",
            "expiration_date",
        ]


class BrowserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Browser
        fields = ["browser_id", "browser_name", "click_count"]


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ["device_id", "device_type", "click_count"]


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ["country_id", "country_name", "click_count"]


class PlatformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Platform
        fields = ["platform_id", "platform_name", "click_count"]


class ClickSerializer(serializers.ModelSerializer):
    country = CountrySerializer(read_only=True)
    browser = BrowserSerializer(read_only=True)
    platform = PlatformSerializer(read_only=True)
    device = DeviceSerializer(read_only=True)
    url = URLSerializer(read_only=True)

    class Meta:
        model = Click
        fields = [
            "click_id",
            "owner",
            "url",
            "timestamp",
            "ip_address",
            "country",
            "browser",
            "platform",
            "device",
            "redirected",
        ]

class CustomRegisterSerializer(RegisterSerializer):
    def save(self, request):
        user = super().save(request)
        guest_user_id = request.session.get("guest_user_id")
        if guest_user_id:
            try:
                guest_user = User.objects.get(id=guest_user_id, user_type="guest")
                URL.objects.filter(owner=guest_user).update(owner=user)
                guest_user.delete()
                del request.session["guest_user_id"]
            except User.DoesNotExist:
                pass
        return user
