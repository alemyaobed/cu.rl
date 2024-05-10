from django.views import View
from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm, CustomUserLoginForm
from django.contrib import messages
from django.contrib.auth import authenticate, login
from .models import CustomUser


def user_signup(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password')
            
            CustomUser.objects.create_user(username, email, password)
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
            
    else:
        form = CustomUserCreationForm()
    return render(request, 'user/signup.html', {'form': form})


def user_login(request):
    if request.method == 'POST':
        form = CustomUserLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return redirect('trial')
    else:
        form = CustomUserLoginForm()
    return render (request, 'user/login.html', {'form': form})

def user_logout(response):
    pass

def user_profile(response):
    pass


class UserProfile(View):
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    