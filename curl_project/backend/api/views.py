from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from user.models import User, Profile
from url_shortening.models import URL, SlotTracker
from analytics.models import Click, Browser, Device, Country, Platform
from .serializers import UserSerializer, ProfileSerializer
from rest_framework import generics


# class UserDetailView(generics.)

@api_view(['GET', 'POST'])
def home(request):
    if request.method == 'POST':
        return Response({'message': 'POST request: created successfully'}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        return Response({'message': 'GET request: gotten successfully'}, status=status.HTTP_200_OK)
