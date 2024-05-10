from django.urls import path, include
from . import views

urlpatterns = [    
    path('user/', include('user.urls')),
    path('', views.index, name='index'),
    path('trial/', views.trial, name='trial'),
    # Add more URLs as needed
]
