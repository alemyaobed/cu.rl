from django.shortcuts import render, redirect
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import View
from django.http import HttpResponseBadRequest
from django.contrib import messages
from .models import URL
from .utils import shorten_url
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError


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
        
        # Check if the original URL is not empty
        if not original_url:
            return HttpResponseBadRequest("URL cannot be empty")
        
        # Validate if the original URL is a valid URL
        validator = URLValidator()
        try:
            validator(original_url)
        except ValidationError:
            return HttpResponseBadRequest("Invalid URL")
        
        # Check if the URL already exists in the database
        existing_url = URL.objects.filter(original_url=original_url).first()
        
        # If URL does not already exist, generate a new shortened URL
        if not existing_url:
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


# class RedirectOriginalURLView(View):
#     def get(self, request, shortened_url):
#         try:
#             url = URL.objects.get(shortened_url=shortened_url)
#             return redirect(url.original_url)
#         except URL.DoesNotExist:
#             return HttpResponseBadRequest("Shortened URL not found")
        

class RedirectURLView(View):
    def get(self, request, slug):
        # Retrieve the URL object with the provided slug
        try:
            url = URL.objects.get(shortened_slug=slug)
        except URL.DoesNotExist:
            # If the URL does not exist, display an error message and redirect to the index page
            error_message = "The shortened URL does not exist."
            messages.error(request, error_message)
            return render(request, 'index.html')

        # Perform the redirect to the original URL
        return redirect(url.original_url)



        
