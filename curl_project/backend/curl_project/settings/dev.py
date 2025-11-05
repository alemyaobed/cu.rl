from .base import *

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Allow credentials for cookies
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Allow SameSite=None in development (testing purposes)
SESSION_COOKIE_SAMESITE = None
SESSION_COOKIE_SECURE = False

# CSRF settings for cookie-based auth
CSRF_COOKIE_SAMESITE = None
CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False  # Must be False so JavaScript can read it
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Use console backend for emails in development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
