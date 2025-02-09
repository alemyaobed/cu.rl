from django.urls import path
from .views import ShortenURLView, URLDeleteView, URLEditView, URLListView, URLDetailView

urlpatterns = [
    path('', URLListView.as_view(), name='list_urls'),
    path('shorten/', ShortenURLView.as_view(), name='shorten_url'),
    path('edit/<uuid:uuid>/', URLEditView.as_view(), name='edit_url'),
    path('delete/<uuid:uuid>/', URLDeleteView.as_view(), name='delete_url'),
    path('detail/<uuid:uuid>/', URLDetailView.as_view(), name='url_detail'),
    # Add more URLs as needed
]

