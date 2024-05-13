from django.db import models
from user.models import User
import uuid


class URL(models.Model):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    original_url = models.URLField(max_length=2000)  # Assuming URLs can be up to 2000 characters long
    shortened_slug = models.CharField(max_length=50, unique=True)  # Adjust max_length as needed
    creation_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(
        verbose_name="Active status",
        default=True,
        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
    )
    expired = models.BooleanField(
        verbose_name="Expiry status",
        default=True,
        help_text="Designates whether the shortened slug is expired or not.",
    )
    
    def shorten(self):
        # Shorten the URL
        # This method should return the shortened URL
        pass

    def __str__(self):
        return self.original_url
    
    @property
    def active_status(self):
        return 'Active' if self.is_active else 'Not Active'
    
    @property
    def expired_status(self):
        return 'Expired' if self.expired else 'Not Expired'
    
    def get_shortened_url(self):
        base_url = 'https://cu.rl/'
        return base_url + self.shortened_slug
    
    
class SlotTracker(models.Model):
    current_slot = models.IntegerField(default=6)  # Initial slot size
    max_records = models.BigIntegerField(default=68719476736)  # Maximum number of unique records for slot size 6
    records_used = models.BigIntegerField(default=0)  # Number of records already used
    slots_left = models.IntegerField(default=0)  # Number of slots left before expanding

    def __str__(self):
        return f"SlotTracker: Current Slot={self.current_slot}, Max Records={self.max_records}, Records Used={self.records_used}, Slots Left={self.slots_left}"

