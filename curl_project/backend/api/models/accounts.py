from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models
import uuid
from curl_project.constants import USER_TYPES, USER_TYPE_FREE


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not username:
            raise ValueError("Users must have a username")
        
        # This was done to allow guest users to have a unique email
        if not email or not email.strip():
            email = f"{username or 'guest'}_{uuid.uuid4().hex[:6]}@guest.local"

        user = self.model(
            username=username,
            email=self.normalize_email(email),
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(
            username=username,
            email=self.normalize_email(email),
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(verbose_name="Username", max_length=255, unique=True)
    email = models.EmailField(
        verbose_name="Email address", max_length=60, unique=True, db_index=True
    )
    user_type = models.CharField(
        max_length=10,
        choices=[(u, u.title()) for u in USER_TYPES],
        default=USER_TYPE_FREE,
    )
    date_joined = models.DateTimeField(verbose_name="Date joined", auto_now_add=True)
    last_login = models.DateTimeField(verbose_name="Last login", auto_now=True)
    is_active = models.BooleanField(
        verbose_name="Active status",
        default=True,
        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
    )
    is_staff = models.BooleanField(
        verbose_name="Staff status",
        default=False,
        help_text="Designates whether the user can log into this admin site.",
    )
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    surname = models.CharField(max_length=100, blank=True)
    other_names = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to="profile_pics", blank=True, null=True)

    def __str__(self):
        return self.user.username
