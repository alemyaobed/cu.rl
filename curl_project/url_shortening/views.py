from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import View
from django.http import HttpResponseBadRequest
from django.contrib import messages
from .models import URL
from .utils import shorten_url
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
from .forms import URLEditForm
from analytics.models import Click, Browser, Platform


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


class URLListView(LoginRequiredMixin, View):
    """
    View class for listing all URLs associated with the logged-in user.
    """
    template_name = 'url_shortening/list_urls.html'
    login_url = 'login'

    def get(self, request):
        urls = URL.objects.filter(owner=request.user)
        return render(request, self.template_name, {'urls': urls})
    
class URLDetailView(LoginRequiredMixin, View):
    template_name = 'url_shortening/url_detail.html'
    login_url = 'login'

    def get(self, request, uuid):
        url_instance = get_object_or_404(URL, uuid=uuid, owner=request.user)
        
        # Get click counts by browser and platform
        clicks_by_browser = Browser.objects.filter(click__url=url_instance).distinct()
        clicks_by_platform = Platform.objects.filter(click__url=url_instance).distinct()
        
        context = {
            'url': url_instance,
            'click_count': Click.objects.filter(url=url_instance).count(),
            'clicks_by_browser': clicks_by_browser,
            'clicks_by_platform': clicks_by_platform,
        }
        
        return render(request, self.template_name, context)
    
class URLEditView(LoginRequiredMixin, View):
    template_name = 'url_shortening/edit_url.html'
    
    def get(self, request, uuid):
        url = get_object_or_404(URL, uuid=uuid, owner=request.user)
        form = URLEditForm(instance=url)
        return render(request, self.template_name, {'form': form})

    def post(self, request, uuid):
        url = get_object_or_404(URL, uuid=uuid, owner=request.user)
        form = URLEditForm(request.POST, instance=url)
        
        if form.is_valid():
            custom_slug = form.cleaned_data.get('custom_slug')
            customize = form.cleaned_data.get('customize')
            
            if customize and custom_slug:
                if URL.objects.filter(shortened_slug=custom_slug).exclude(uuid=url.uuid).exists():
                    form.add_error('custom_slug', 'This custom slug is already in use.')
                else:
                    url.shortened_slug = custom_slug
                    url.customized = True
            else:
                # Generate a new shortened slug if not customizing
                url.customized = False
                url.shortened_slug = url.generate_shortened_url()
            
            url.save()
            messages.success(request, 'URL updated successfully.')
            return redirect('list_urls')
        
        return render(request, self.template_name, {'form': form})



class URLDeleteView(LoginRequiredMixin, View):
    """
    View class for deleting a specific URL.
    """
    template_name = 'url_shortening/confirm_delete.html'
    login_url = 'login'

    def get(self, request, uuid):
        url_instance = get_object_or_404(URL, uuid=uuid, owner=request.user)
        return render(request, self.template_name, {'url': url_instance})

    def post(self, request, uuid):
        url_instance = get_object_or_404(URL, uuid=uuid, owner=request.user)
        url_instance.delete()
        messages.success(request, "URL deleted successfully.")
        return redirect('list_urls')
