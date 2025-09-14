from .base import *

DEBUG = False
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

cors_allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS_PROD", "")

CORS_ALLOWED_ORIGINS = (
    [origin.strip() for origin in cors_allowed_origins_env.split(",") if origin.strip()]
    if cors_allowed_origins_env
    else []
)


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DATABASE_NAME"),
        "USER": os.getenv("DATABASE_USER"),
        "PASSWORD": os.getenv("DATABASE_PASSWORD"),
        "HOST": os.getenv("DATABASE_HOST", "localhost"),
        "PORT": os.getenv("DATABASE_PORT", "5432"),
    }
}

# Security best practices
SECURE_HSTS_SECONDS = 31536000
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Email backend stays SMTP in production
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

LOGGING["root"]["level"] = "INFO"
