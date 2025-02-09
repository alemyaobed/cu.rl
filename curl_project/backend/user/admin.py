from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile


admin.site.site_header = ('CU.RL Administration')
admin.site.index_title = ('CU.RL Admin Dashboard')


# Register the User model
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login')
    list_filter = ('is_active', 'staff', 'admin') 
    search_fields = ('email', 'username')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'staff', 'admin')}),  # Remove 'is_superuser' and 'is_staff'
        ('Important dates', {'fields': ()}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'is_active', 'is_staff', 'is_superuser')}
        ),
    )



# Register the Profile model
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'surname', 'other_names', 'location', 'premium_user')
    search_fields = ('user__username', 'user__email', 'surname', 'other_names')
    list_filter = ('premium_user', 'location')

