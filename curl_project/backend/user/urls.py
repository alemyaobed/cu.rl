from django.urls import path, include
from .views import (
    UserLoginView, UserSignupView, UserProfileView,
    user_logout, delete_profile_picture, index, about, api_page, docs)
from analytics.views import RedirectURLView

urlpatterns = [
    path('', index, name='index'),
    path('about/', about, name='about'),
    path('api-page/', api_page, name='api_page'),
    path('docs/', docs, name='docs'),
    path('<slug:slug>/', RedirectURLView.as_view(), name='redirect_url'),
    path('user/signup/', UserSignupView.as_view(), name='signup'),
    path('user/login/', UserLoginView.as_view(), name='login'),
    path('user/logout/', user_logout, name='logout'),
    path('user/profile/', UserProfileView.as_view(), name='profile'),
    path('user/profile/delete_picture/', delete_profile_picture, name='delete_profile_picture'),
    path("user/urls/", include('url_shortening.urls')),
    # Add more URLs as needed
]
