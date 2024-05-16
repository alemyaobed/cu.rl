from django.urls import path, include
from . import views
from analytics.views import RedirectURLView

urlpatterns = [    
    
    path('', views.index, name='index'),
    path('<slug:slug>/', RedirectURLView.as_view(), name='redirect_url'),
    path('trial/', views.trial, name='trial'),
    # Add more URLs as needed
]
