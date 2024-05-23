from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User, Profile
from django.contrib.auth.forms import AuthenticationForm
from django.utils.translation import gettext_lazy as _

class CustomUserCreationForm(UserCreationForm):
    # Define custom error messages
    error_messages = {
        'password_mismatch': _("The two password fields didn't match."),
        'password_too_similar': _("Your password can’t be too similar to your other personal information."),
        'password_too_short': _("Your password must contain at least 8 characters."),
        'password_common': _("Your password can’t be a commonly used password."),
        'password_numeric': _("Your password can’t be entirely numeric."),
    }

    # Override clean_password2 method to provide custom validation
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
        required = {
            'username': True,
            'email': True,
            'password1': True,
            'password2': True,
        }

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
