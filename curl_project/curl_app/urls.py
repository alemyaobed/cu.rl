from django.urls import path, include
from . import views

urlpatterns = [    
    path('user/', include('user.urls')),
    path('', views.index, name='index'),
    # Add more URLs as needed
]
