from django.db import models
from user.models import User
from url_shortening.models import URL

class Click(models.Model):
    click_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    url = models.ForeignKey(URL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    country = models.ForeignKey('Country', on_delete=models.SET_NULL, null=True, blank=True)
    browser = models.ForeignKey('Browser', on_delete=models.SET_NULL, null=True, blank=True)
    platform = models.ForeignKey('Platform', on_delete=models.SET_NULL, null=True, blank=True)
    device = models.ForeignKey('Device', on_delete=models.SET_NULL, null=True, blank=True)
    

class Device(models.Model):
    device_id = models.AutoField(primary_key=True)
    device_type = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.device_type

class Browser(models.Model):
    browser_id = models.AutoField(primary_key=True)
    browser_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.browser_name
    

class Country(models.Model):
    country_id = models.AutoField(primary_key=True)
    country_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.country_name
    

class Platform(models.Model):
    platform_id = models.AutoField(primary_key=True)
    platform_name = models.CharField(max_length=100)
    click_count = models.IntegerField(default=0)
    
    def __str__(self):
        return self.platform_name
