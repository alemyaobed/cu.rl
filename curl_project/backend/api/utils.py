"""
Utility functions for the API.
"""

import random
import string
import re
from urllib.parse import urlparse
from ip2geotools.databases.noncommercial import DbIpCity
from user_agents import parse

from .models.url_shortening import URL

from logging import getLogger

logger = getLogger(__name__)


def normalize_url(url: str) -> str:
    """Ensure URLs include a scheme, defaulting to https:// when missing."""
    if not url:
        return url
    url = url.strip()
    lower = url.lower()
    if not (lower.startswith("http://") or lower.startswith("https://")):
        return f"https://{url}"
    return url


def get_ip_address(request):
    """
    Returns the IP address of the user.
    """
    user_ip_address = request.META.get("HTTP_X_FORWARDED_FOR")
    if user_ip_address:
        ip = user_ip_address.split(",")[0]
    else:
        ip = request.META.get("REMOTE_ADDR")
    return ip


def get_geolocation(ip_address):
    """
    Returns the geolocation of the user.
    """
    try:
        response = DbIpCity.get(ip_address, api_key="free")
        logger.info(f"Geolocation response: {response}")
        return response.country
    except Exception:
        return None


def get_browser(request):
    """
    Returns the browser of the user.
    """
    return parse(request.META.get("HTTP_USER_AGENT", "")).browser.family


def get_device(request):
    """
    Returns the device of the user.
    """
    user_agent = parse(request.META.get("HTTP_USER_AGENT", ""))
    if user_agent.is_mobile:
        return "Mobile"
    if user_agent.is_tablet:
        return "Tablet"
    if user_agent.is_pc:
        return "PC"
    if user_agent.is_bot:
        return "Bot"
    return "Unknown"


def get_platform(request):
    """
    Returns the platform of the user.
    """
    return parse(request.META.get("HTTP_USER_AGENT", "")).os.family


def generate_unique_slug(length=6):
    """
    Generates a unique slug for a URL.
    """
    characters = string.ascii_letters + string.digits
    while True:
        slug = "".join(random.choice(characters) for _ in range(length))
        if not URL.objects.filter(shortened_slug=slug).exists():
            return slug