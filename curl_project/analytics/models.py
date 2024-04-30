from django.db import models
from user.models import CustomUser
from url_shortening.models import URL

class Click(models.Model):
    click_id = models.AutoField(primary_key=True)
    url = models.ForeignKey(URL, on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    referrer = models.ForeignKey('Referrer', on_delete=models.SET_NULL, null=True, blank=True)
    country = models.CharField(max_length=100)
    browser = models.ForeignKey('Browser', on_delete=models.SET_NULL, null=True, blank=True)
    platform = models.CharField(max_length=100)
    device = models.ForeignKey('Device', on_delete=models.SET_NULL, null=True, blank=True)

class Referrer(models.Model):
    referrer_id = models.AutoField(primary_key=True)
    referrer_url = models.URLField(unique=True)
    click_count = models.IntegerField(default=0)

class Device(models.Model):
    device_id = models.AutoField(primary_key=True)
    device_type = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)

class Browser(models.Model):
    browser_id = models.AutoField(primary_key=True)
    browser_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)
