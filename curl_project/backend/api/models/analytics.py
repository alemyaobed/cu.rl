import uuid
from django.db import models
from .accounts import User
from .url_shortening import URL


class Click(models.Model):
    click_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    url = models.ForeignKey(URL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    country = models.ForeignKey(
        "Country", on_delete=models.SET_NULL, null=True, blank=True
    )
    browser = models.ForeignKey(
        "Browser", on_delete=models.SET_NULL, null=True, blank=True
    )
    platform = models.ForeignKey(
        "Platform", on_delete=models.SET_NULL, null=True, blank=True
    )
    device = models.ForeignKey(
        "Device", on_delete=models.SET_NULL, null=True, blank=True
    )


class Device(models.Model):
    device_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device_type = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)

    def __str__(self):
        return self.device_type


class Browser(models.Model):
    browser_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    browser_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)

    def __str__(self):
        return self.browser_name


class Country(models.Model):
    country_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    country_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)

    def __str__(self):
        return self.country_name


class Platform(models.Model):
    platform_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    platform_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)

    def __str__(self):
        return self.platform_name
