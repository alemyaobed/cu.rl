# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from guest_user.signals import guest_created, converted as guest_user_converted
from .models.accounts import User, Profile
from curl_project.constants import USER_TYPE_FREE, USER_TYPE_GUEST
from logging import getLogger

logger = getLogger(__name__)


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Handles both regular user and guest profile creation.
    """
    logger.info(
        f"post_save signal received for User: {instance.uuid}, created: {created}"
    )
    if created:
        Profile.objects.create(user=instance)
    else:
        try:
            instance.profile.save()
        except Profile.DoesNotExist:
            pass


@receiver(guest_created)
def mark_guest_user(sender, request, user, **kwargs):
    user.user_type = USER_TYPE_GUEST
    user.save(update_fields=["user_type"])


@receiver(guest_user_converted)
def handle_guest_user_converted(sender, guest, user, request, **kwargs):
    """
    When a guest user signs up or logs in properly,
    update their profile to reflect they are now a free user.
    """
    user.user_type = USER_TYPE_FREE
    user.save(update_fields=["user_type"])
