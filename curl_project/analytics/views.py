from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages
from url_shortening.models import URL
from .models import Click, Platform, Device, Browser, Country
from ip2geotools.databases.noncommercial import DbIpCity
from user_agents import parse

class RedirectURLView(View):
    def get(self, request, slug):
        try:
            # Retrieve the URL object with the provided slug
            url = URL.objects.get(shortened_slug=slug)
        except URL.DoesNotExist:
            # If the URL does not exist, display an error message and redirect to the index page
            error_message = "The shortened URL does not exist."
            messages.error(request, error_message)
            return render(request, 'index.html')

        # Get IP address from request
        ip_address = request.META.get('REMOTE_ADDR')

        # Get user agent and extract details
        user_agent_header = request.headers.get('User-Agent')
        if user_agent_header:
            user_agent = parse(user_agent_header)
            platform_name = user_agent.os.family
            browser_name = user_agent.browser.family
            device_type = user_agent.device.family
        else:
            # Fallback if user-agent header is missing or invalid
            platform_name = "Unknown"
            browser_name = "Unknown"
            device_type = "Unknown"

        # Get or create Device object
        device, _ = Device.objects.get_or_create(device_type=device_type)
        device.click_count += 1
        device.save()

        # Get or create Browser object
        browser, _ = Browser.objects.get_or_create(browser_name=browser_name)
        browser.click_count += 1
        browser.save()
        
        # Get or create Platform object
        platform, _ = Platform.objects.get_or_create(platform_name=platform_name)
        platform.click_count += 1
        platform.save()

        try:
            # Perform geolocation based on IP address
            response = DbIpCity.get(ip_address, api_key='free')
            country_name = response.country
            
            
        except Exception as e:
            # Handle geolocation lookup error
            country_name = "Unknown"
            #messages.warning(request, "Failed to determine country from IP address.")

        # Get or create Country object
        country, _ = Country.objects.get_or_create(country_name=country_name)
        country.click_count += 1
        country.save()

        # Create Click object
        Click.objects.create(
            url=url,
            owner=url.owner,
            ip_address=ip_address,
            country=country,
            browser=browser,
            platform=platform,
            device=device
        )

        # Perform the redirect to the original URL
        return redirect(url.original_url)
