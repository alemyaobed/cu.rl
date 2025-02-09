from django.contrib import admin
from .models import Click, Device, Browser, Platform, Country

# # Define admin class for Click model
# class ClickAdmin(admin.ModelAdmin):
#     list_display = ('click_id', 'owner', 'url', 'timestamp', 'ip_address', 'country', 'browser', 'platform', 'device')
#     # Add more configurations as needed

# # Define admin class for Device model
# class DeviceAdmin(admin.ModelAdmin):
#     list_display = ('device_id', 'device_type', 'click_count')
#     # Add more configurations as needed

# # Define admin class for Browser model
# class BrowserAdmin(admin.ModelAdmin):
#     list_display = ('browser_id', 'browser_name', 'click_count')
#     # Add more configurations as needed

# # Define admin class for Platform model
# class PlatformAdmin(admin.ModelAdmin):
#     list_display = ('platform_id', 'platform_name', 'click_count')
#     # Add more configurations as needed

# # Register models with their corresponding admin classes
# admin.site.register(Click, ClickAdmin)
# admin.site.register(Device, DeviceAdmin)
# admin.site.register(Browser, BrowserAdmin)
# admin.site.register(Platform, PlatformAdmin)

@admin.register(Click)
class ClickAdmin(admin.ModelAdmin):
    list_display = ('click_id', 'owner', 'url', 'timestamp', 'ip_address', 'country', 'browser', 'platform', 'device')
    list_filter = ('timestamp', 'country', 'browser', 'platform', 'device')
    search_fields = ('ip_address', 'country')

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('device_id', 'device_type', 'click_count')
    search_fields = ('device_type',)

@admin.register(Browser)
class BrowserAdmin(admin.ModelAdmin):
    list_display = ('browser_id', 'browser_name', 'click_count')
    search_fields = ('browser_name',)

@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    list_display = ('platform_id', 'platform_name', 'click_count')
    search_fields = ('platform_name',)


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('country_id', 'country_name', 'click_count')
    search_fields = ('country_name',)
