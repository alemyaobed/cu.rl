from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models.accounts import User, Profile
from .models.url_shortening import URL, SlotTracker
from .models.analytics import Click, Browser, Device, Country, Platform
from .serializers import UserSerializer, ProfileSerializer
from rest_framework import generics


# class UserDetailView(generics.)

@api_view(['GET', 'POST'])
def home(request):
    if request.method == 'POST':
        return Response({'message': 'POST request: created successfully after new update and cleanup'}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        return Response({'message': 'GET request: gotten successfully after new update and cleanup'}, status=status.HTTP_200_OK)
