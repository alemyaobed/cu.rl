from django.db import models
from user.models import User


class URL(models.Model):
    url_id = models.AutoField(primary_key=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    original_url = models.URLField(max_length=2000)  # Assuming URLs can be up to 2000 characters long
    shortened_url = models.URLField(max_length=200)  # Adjust max_length as needed
    creation_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_url
