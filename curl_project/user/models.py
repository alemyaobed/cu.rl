from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')

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
        user.staff = True
        user.admin = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    uuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(verbose_name="Username", max_length=255, unique=True)
    email = models.EmailField(verbose_name="Email address", max_length=60, unique=True, db_index=True)
    date_joined = models.DateTimeField(verbose_name="Date joined", auto_now_add=True)
    last_login = models.DateTimeField(verbose_name="Last login", auto_now=True)
    is_active = models.BooleanField(
        verbose_name="Active status",
        default=True,
        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
    )
    staff = models.BooleanField(
        verbose_name="Staff status",
        default=False,
        help_text="Designates whether the user can log into this admin site.",
    )
    admin = models.BooleanField(
        verbose_name="Superuser status",
        default=False,
        help_text="Designates whether the user has all permissions without explicitly assigning them.",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username

    @property
    def is_staff(self):
        return self.staff

    @property
    def is_superuser(self):
        return self.admin

