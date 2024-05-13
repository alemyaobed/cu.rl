from django.urls import path
from . import views
from url_shortening import views as URL_views

urlpatterns = [
    path('signup/', views.user_signup, name='signup'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('profile/', views.user_profile, name='profile'),
    path('inside/', URL_views.ShortenURLView.as_view(), name='shorten_url_page' )
    # Add more URLs as needed
]
