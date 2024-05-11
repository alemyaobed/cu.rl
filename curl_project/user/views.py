from django.views import View
from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm, CustomUserLoginForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from .models import User
from django.views.decorators.cache import cache_control


def user_signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            
            User.objects.create_user(username, email, password)
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
            
    else:
        form = CustomUserCreationForm()
    return render(request, 'user/signup.html', {'form': form})


def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        if email and password:  # Check if email and password are provided
            print("username", email, password)
            user = authenticate(request, email=email, password=password)
            if user:
                print("Yes user deu")
            print("No user here")
            if user is not None:
                login(request, user)
                return redirect('trial')
    return render(request, 'user/login.html')


def user_logout(request):
    logout(request)
    return redirect('index')

def user_profile(response):
    pass


class UserProfile(View):
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    