from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
    list_filter = ('is_active', 'staff', 'admin', 'date_joined')
    search_fields = ('email', 'username')
    ordering = ('-date_joined',)

admin.site.register(User, CustomUserAdmin)
