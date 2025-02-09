# forms.py
from django import forms
from .models import URL

class URLEditForm(forms.ModelForm):
    custom_slug = forms.CharField(required=False, max_length=100, help_text="Optional: Enter a custom shortened URL slug.")
    customize = forms.BooleanField(required=False, help_text="Check this box to customize the shortened URL.")

    class Meta:
        model = URL
        fields = ['original_url', 'custom_slug', 'customize']

    def clean_custom_slug(self):
        custom_slug = self.cleaned_data.get('custom_slug')
        if custom_slug and not custom_slug.isalnum():
            raise forms.ValidationError('Custom slug can only contain letters and numbers.')
        return custom_slug
