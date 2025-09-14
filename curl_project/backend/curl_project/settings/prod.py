from .base import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

cors_allowed_origins_env = os.getenv("CORS_ALLOWED_ORIGINS_PROD", "")

CORS_ALLOWED_ORIGINS = (
    [origin.strip() for origin in cors_allowed_origins_env.split(",") if origin.strip()]
    if cors_allowed_origins_env
    else []
)


DATABASES = {
    'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
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
