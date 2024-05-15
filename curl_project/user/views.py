from django.views import View
from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm, CustomUserLoginForm
from django.contrib import messages
from django.contrib.auth import authenticate, get_user_model, login, logout
from .models import User
from django.views.decorators.cache import cache_control

def user_signup(request):
    if request.method == 'POST':
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
            
    else:
        form = CustomUserCreationForm()
    return render(request, 'user/signup.html', {'form': form})


# def user_login(request):
#     if request.method == 'POST':
#         email = request.POST.get('email')
#         password = request.POST.get('password')
#         if email and password:  # Check if email and password are provided
#             print("username", email, password)
#             user = authenticate(request, email=email, password=password)
#             if user:
#                 print(user.is_active)
#                 print("Yes user deu")
#             print("No user here")
#             if user is not None:
#                 login(request, user)
#                 return redirect('shorten_url_page')
#     return render(request, 'user/login.html')


def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        if email and password:  # Check if email and password are provided
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('shorten_url_page')
            else:
                messages.error(request, 'Invalid email or password. Please try again.')
    return render(request, 'user/login.html')



def user_logout(request):
    logout(request)
    return redirect('login')

def user_profile(response):
    pass


class UserProfile(View):
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    