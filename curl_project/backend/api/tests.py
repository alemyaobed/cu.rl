from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models.accounts import User

class AuthTests(APITestCase):
    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword'
        self.email = 'test@example.com'
        self.user = User.objects.create_user(username=self.username, email=self.email, password=self.password)

    def test_login_returns_tokens(self):
        """
        Ensure login view returns access and refresh tokens.
        """
        url = reverse('rest_login')
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)