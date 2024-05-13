from django.shortcuts import render

# Create your views here.
def index(request):
    page_title = 'Home'
    return render(request, 'index.html', {'page_title': page_title})

def trial(request):
    page_title = 'Trial'
    return render(request, 'trial.html', {'page_title': page_title})

def inside(request):
    page_title = 'Inside'
    return render(request, 'url_shortening/shorten_url.html', {'page_title': page_title})
