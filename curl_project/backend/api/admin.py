from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models.accounts import User, Profile
from .models.analytics import Click, Device, Browser, Country, Platform
from .models.url_shortening import URL, SlotTracker


class CustomUserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "is_active", "is_staff", "is_superuser")
    list_filter = ("is_active", "is_staff", "is_superuser")
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2"),
            },
        ),
    )
    search_fields = ("email", "username")
    ordering = ("email",)
    filter_horizontal = ("groups", "user_permissions")


admin.site.register(User, CustomUserAdmin)
admin.site.register(Profile)

admin.site.register(URL)
admin.site.register(SlotTracker)
admin.site.register(Click)
admin.site.register(Device)
admin.site.register(Browser)
admin.site.register(Country)
admin.site.register(Platform)
