from django.contrib import admin
from .models import URL


class URLAdmin(admin.ModelAdmin):
    list_display = (
        'uuid', 'owner', 'original_url', 'shortened_slug', 'creation_date',
        'active_status', 'expired_status', 'is_customized')
    list_filter = ('is_active', 'expired', 'creation_date', 'customized')
    search_fields = ('original_url', 'shortened_slug', 'owner')
    readonly_fields = ('creation_date',)

admin.site.register(URL, URLAdmin)
