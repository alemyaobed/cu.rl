from django.db import models
from django.utils import timezone
from django.conf import settings
from .accounts import User
import uuid


class URL(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    original_url = models.URLField(max_length=2000)
    shortened_slug = models.CharField(max_length=50, unique=True)
    creation_date = models.DateTimeField(auto_now_add=True)
    customized = models.BooleanField(
        verbose_name="Customized URL",
        default=False,
        help_text="Designates whether the shortened slug is customized or not.",
    )
    is_active = models.BooleanField(
        verbose_name="Active status",
        default=True,
        help_text="Designates whether the shortened slug is active or not. Unselect this instead of deleting records.",
    )
    expiration_date = models.DateTimeField(
        verbose_name="Expiration date",
        null=True,
        blank=True,
        help_text="The date and time when the shortened URL will expire.",
    )

    def __str__(self):
        return self.original_url

    @property
    def active_status(self):
        return "Active" if self.is_active else "Not Active"

    @property
    def expired(self):
        if self.expiration_date:
            return timezone.now() > self.expiration_date
        return False

    @property
    def is_accessible(self):
        return self.is_active and not self.expired

    @property
    def is_customized(self):
        return "Yes" if self.customized else "No"

    def get_shortened_url(self):
        from django.contrib.sites.models import Site
        domain = Site.objects.get_current().domain
        protocol = 'https' if not settings.DEBUG else 'http'
        return f'{protocol}://{domain}/{self.shortened_slug}'
