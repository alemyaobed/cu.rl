from django.urls import path, include
from .views import UserLoginView, UserSignupView, UserProfileView, user_logout

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', user_logout, name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path("urls/", include('url_shortening.urls')),
    # Add more URLs as needed
]
