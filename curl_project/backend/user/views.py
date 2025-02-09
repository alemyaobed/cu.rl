from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm, CustomUserLoginForm, ProfileForm
from django.contrib import messages
from django.contrib.auth.views import LoginView
from django.contrib.auth import authenticate, login, logout
from .models import User, Profile
from django.views.decorators.cache import cache_control
from django.contrib.auth.decorators import login_required


def index(request):
    page_title = 'Index'
    return render(request, 'index.html', {'page_title': page_title})

def about(request):
    page_title = 'About'
    return render(request, 'about.html', {'page_title': page_title})

def api_page(request):
    page_title = 'API Page'
    return render(request, 'api_page.html', {'page_title': page_title})

def docs(request):
    page_title = 'Docs'
    return render(request, 'docs.html', {'page_title': page_title})

class UserSignupView(View):
    """
    View class for user signup.
    """
    template_name = 'user/signup.html'
    page_title = 'Sign Up'
    
    def get(self, request):
        form = CustomUserCreationForm()
        
        context = {'form': form, 'page_title': self.page_title}
        
        return render(request, self.template_name, context=context)
    
    def post(self, request):
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password2')
            
            user = User.objects.create_user(username=username, email=email)
            user.set_password(password)  # Set password
            user.save()  # Save user with hashed password
            
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
        
        context = {'form': form, 'page_title': self.page_title}
        
        # If form is not valid, render the form again with errors
        return render(request, self.template_name, context=context)



class UserLoginView(LoginView):
    template_name = 'user/login.html'
    redirect_authenticated_user = True
    page_title = 'Log In'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['page_title'] = self.page_title
        return context
    
    def post(self, request, *args, **kwargs):
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        if email and password:
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('list_urls')  # Redirect to the URL list view
            else:
                messages.error(request, 'Invalid email or password. Please try again.')
        
        # If authentication fails or if email and password are not provided
        return super().get(request, *args, **kwargs)



def user_logout(request):
    logout(request)
    return redirect('login')

class UserProfileView(LoginRequiredMixin, View):
    template_name = 'user/profile.html'
    login_url = '/login/'
    page_title = 'Profile'

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        form = ProfileForm(instance=profile)
        
        context = {
            'form': form,
            'profile': profile,
            'user': request.user,
            'page_title': self.page_title,
        }
        
        return render(request, self.template_name, context=context)

    def post(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('list_urls')
        
        context = {
            'form': form,
            'profile': profile,
            'user': request.user,
            'page_title': self.page_title,
        }
        return render(request, self.template_name, context=context)    

@login_required
def delete_profile_picture(request):
    profile = request.user.profile
    if profile.profile_picture:
        profile.profile_picture.delete()
    return redirect('profile')

    