from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Profile
from django.contrib.auth.forms import AuthenticationForm

class CustomUserCreationForm(UserCreationForm):

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')


class CustomUserLoginForm(AuthenticationForm):
    
    class Meta:
        model = User
        fields = ('email', 'password')

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['surname', 'other_names', 'bio', 'location', 'birth_date', 'website', 'profile_picture']
        widgets = {
            'birth_date': forms.DateInput(attrs={'type': 'date'}),
        }
