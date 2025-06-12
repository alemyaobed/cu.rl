# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from guest_user.signals import guest_user_created, guest_user_converted
from .models.accounts import User, Profile
from curl_project.constants import USER_TYPE_FREE, USER_TYPE_GUEST


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Handles both regular user and guest profile creation.
    """
    if created:
        # Default to free, unless explicitly marked as guest
        user_type = USER_TYPE_GUEST if getattr(instance, "is_guest", False) else USER_TYPE_FREE
        Profile.objects.create(user=instance, user_type=user_type)
    else:
        # Ensure profile is saved if user updates (standard pattern)
        instance.profile.save()


@receiver(guest_user_converted)
def handle_guest_user_converted(sender, guest, user, request, **kwargs):
    """
    When a guest user signs up or logs in properly,
    update their profile to reflect they are now a free user.
    """
    if hasattr(user, "profile"):
        user.profile.user_type = USER_TYPE_FREE
        user.profile.save()
