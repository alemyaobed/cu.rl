from django.contrib.auth.models import AbstractUser
from django.db import models



class CustomUser(AbstractUser):
    # Additional fields
    email = models.CharField(max_length=255, unique=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return (self.username)
