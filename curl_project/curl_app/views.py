from django.shortcuts import render

# Create your views here.
def index(request):
    page_title = 'Home'
    return render(request, 'index.html', {'page_title': page_title})