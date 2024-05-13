from django.views import View
from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm, CustomUserLoginForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from .models import User
from django.views.decorators.cache import cache_control
from url_shortening.utils import *

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
                # s_url = shorten_url(str("https://sqldbm.com/Home/?returnUrl=%2fZendesk%2fLogIn%3fbrand_id%3d14256026402317%26locale_id%3d1%26return_to%3dhttps%253A%252F%252Fsupport.sqldbm.com%252Fhc%252Fen-us%252Frequests%26timestamp%3d1713970278#sign-in"))
                # s_url1 = shorten_url1(str("https://sqldbm.com/Home/?returnUrl=%2fZendesk%2fLogIn%3fbrand_id%3d14256026402317%26locale_id%3d1%26return_to%3dhttps%253A%252F%252Fsupport.sqldbm.com%252Fhc%252Fen-us%252Frequests%26timestamp%3d1713970278#sign-in"))

                # print(s_url)
                # print(s_url1)
                print(user.is_active)
                print("Yes user deu")
            print("No user here")
            if user is not None:
                login(request, user)
                return redirect('shorten_url_page')
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
    