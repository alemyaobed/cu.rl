from django.views import View
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm


def signup(request):
    form = UserCreationForm()
    return render(request, 'user/signup.html', {'form': form})

def login(response):
    pass

def logout(response):
    pass

def profile(response):
    pass


class UserProfile(View):
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    