from rest_framework import serializers
from .models.accounts import User, Profile
from .models.url_shortening import URL, SlotTracker
from .models.analytics import Click, Browser, Device, Country, Platform


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "uuid",
            "username",
            "email",
            "date_joined",
            "last_login",
            "is_active",
            "is_staff",
            "is_superuser",
        ]


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
            "user_type",
        ]


class URLSerializer(serializers.ModelSerializer):

    class Meta:
        model = URL
        fields = []


class SlotTrackerSerializer(serializers.ModelSerializer):

    class Meta:
        model = SlotTracker
        fields = []


class ClickSerializer(serializers.ModelSerializer):

    class Meta:
        model = Click
        fields = []


class BrowserSerializer(serializers.ModelSerializer):

    class Meta:
        model = Browser
        fields = []


class DeviceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Device
        fields = []


class CountrySerializer(serializers.ModelSerializer):

    class Meta:
        model = Country
        fields = []


class PlatformSerializer(serializers.ModelSerializer):

    class Meta:
        model = Platform
        fields = []
