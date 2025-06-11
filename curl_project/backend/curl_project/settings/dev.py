from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Allow all origins during dev
CORS_ALLOW_ALL_ORIGINS = True

# Use console backend for emails in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
