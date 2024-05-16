from django.shortcuts import render, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import View
from django.http import HttpResponseBadRequest
from django.contrib import messages
from .models import URL
from .utils import shorten_url
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
import re


class ShortenURLView(LoginRequiredMixin, View):
    """
    View class for shortening URLs.
    
    GET request:
    Renders the page for entering the long URL.

    POST request:
    Handles form submission to create and shorten a new URL.
    """

    template_name = 'url_shortening/shorten_url.html'
    login_url = 'login'  # Redirects users to the login page if not authenticated

    def get(self, request):
        """
        Handles GET request to render the page for entering the long URL.

        Parameters:
        - request: HttpRequest object
        
        Returns:
        - HttpResponse object
        """
        return render(request, self.template_name)

    def post(self, request):
        """
        Handles POST request to create and shorten a new URL.

        Parameters:
        - request: HttpRequest object

        Returns:
        - HttpResponse object
        """
        # Retrieve the long URL from the form data
        original_url = request.POST.get('long_url')
        
        # Retrieve custom slug if there is one
        custom_slug = request.POST.get('custom_slug')
        print(custom_slug)
        # Check if the original URL is not empty
        if not original_url:
            return HttpResponseBadRequest("URL cannot be empty")
        
        # Validate if the original URL is a valid URL
        validator = URLValidator()
        try:
            validator(original_url)
        except ValidationError:
            return HttpResponseBadRequest("Invalid URL")
        
        # Backend validation for custom slug
        if custom_slug and not self.is_valid_custom_slug(custom_slug):
            messages.error(request, 'Invalid custom slug. Please use only letters, numbers, hyphens, and underscores.')
            return render(request, self.template_name)
        
        if custom_slug:
            shortened_slug = custom_slug
            # Check if the custom slug already exists
            if URL.objects.filter(shortened_slug=shortened_slug).exists():
                messages.error(request, "Custom slug already exists. Please choose a different one.")
                return render(request, self.template_name)
            else:
                # Check if the URL already exists for the user
                if URL.objects.filter(owner=request.user, original_url=original_url).exists():
                    existing_url = URL.objects.filter(owner=request.user, original_url=original_url).first()
                    # Ask if to modify or not
                    if not existing_url.customized:
                        existing_url.shortened_slug = shortened_slug
                        existing_url.customized = True
                        existing_url.save()
                    else:
                        existing_url.shortened_slug = shortened_slug
                        existing_url.save()   
                    messages.info(request, "You have already exists and have been updated.")
                else:
                    # If URL does not already exist, create a new URL object
                    new_url_obj = URL.objects.create(original_url=original_url, owner=request.user, shortened_slug=shortened_slug, customized=True)
                    existing_url = new_url_obj
        else:
            # Check if the URL already exists for the user
            if URL.objects.filter(owner=request.user, original_url=original_url).exists():
                existing_url = URL.objects.filter(owner=request.user, original_url=original_url).first()
                messages.info(request, "You have already shortened this URL.")
            else:
                # If URL does not already exist, generate a new shortened URL
            
                # Create a new URL object
                new_url_obj = URL.objects.create(original_url=original_url, owner=request.user)
                # Generate a shortened URL slug
                shortened_slug = self.generate_shortened_url(new_url_obj)
                # Save the shortened URL slug to the database
                new_url_obj.shortened_slug = shortened_slug
                new_url_obj.save()
                # Set existing_url to the new URL object
                existing_url = new_url_obj
        
        # Retrieve the shortened URL
        shortened_url = existing_url.get_shortened_url()
        
        context = {
            'shortened_url': shortened_url,
            'original_url': existing_url.original_url
            }
        
        # Render the success template with the shortened URL
        return render(request, self.template_name, context=context)

    def generate_shortened_url(self, original_url):
        """
        Generates a shortened URL slug using the provided original URL.
        This uses the utility function shorten_url for shortening the URL

        Parameters:
        - original_url: str, the original URL to be shortened

        Returns:
        - str: the shortened URL slug
        """
        # Use utility function to generate shortened URL slug
        shortened_slug = shorten_url(original_url)
        return shortened_slug
    
    def is_valid_custom_slug(self, custom_slug):
        return False if not custom_slug.isalnum() or len(custom_slug) < 6 else True



# class RedirectURLView(View):
#     def get(self, request, slug):
#         # Retrieve the URL object with the provided slug
#         try:
#             print(request.META.get('REMOTE_ADDR'))
#             url = URL.objects.get(shortened_slug=slug)
#         except URL.DoesNotExist:
#             # If the URL does not exist, display an error message and redirect to the index page
#             error_message = "The shortened URL does not exist."
#             messages.error(request, error_message)
#             return render(request, 'index.html')

#         # Perform the redirect to the original URL
#         return redirect(url.original_url)
