from django.contrib import admin
from .models.accounts import User, Profile
from .models.url_shortening import URL
from .models.analytics import Click, Country, Browser, Platform, Device


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "user_type", "is_staff", "date_joined")
    search_fields = ("username", "email")
    list_filter = ("user_type", "is_staff", "is_active")


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "surname", "other_names")
    search_fields = ("user__username", "surname")


@admin.register(URL)
class URLAdmin(admin.ModelAdmin):
    list_display = (
        "original_url",
        "shortened_slug",
        "owner",
        "creation_date",
        "is_active",
    )
    search_fields = ("original_url", "shortened_slug", "owner__username")
    list_filter = ("is_active", "customized")


@admin.register(Click)
class ClickAdmin(admin.ModelAdmin):
    list_display = ("url", "timestamp", "ip_address", "country", "browser")
    search_fields = ("url__shortened_slug", "ip_address")
    list_filter = ("timestamp", "country", "browser", "platform", "device")


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ("country_name", "click_count")
    search_fields = ("country_name",)


@admin.register(Browser)
class BrowserAdmin(admin.ModelAdmin):
    list_display = ("browser_name", "click_count")
    search_fields = ("browser_name",)


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ("platform_name", "click_count")
    search_fields = ("platform_name",)


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("device_type", "click_count")
    search_fields = ("device_type",)
