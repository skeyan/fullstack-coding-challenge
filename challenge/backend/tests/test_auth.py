from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from complaint_app.models import UserProfile

class AuthenticationTests(TestCase):
    def setUp(self):
        """Set up test data"""
        # Create a test user with the NYC Council format
        self.username = "jdoe"  # First initial + last name
        self.password = "doe-1"  # lastname-district
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password,
            first_name="John",
            last_name="Doe"
        )
        
        # Create associated UserProfile
        self.profile = UserProfile.objects.create(
            user=self.user,
            full_name="John Doe",
            district="1",
            borough="Manhattan"
        )
        
        self.client = APIClient()
        
    def test_login_success(self):
        """Test successful login returns token"""
        response = self.client.post('/login/', {
            'username': self.username,
            'password': self.password
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
    def test_login_invalid_credentials(self):
        """Test login fails with invalid credentials"""
        response = self.client.post('/login/', {
            'username': self.username,
            'password': 'wrongpassword'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_login_missing_fields(self):
        """Test login fails when fields are missing"""
        # Missing password
        response = self.client.post('/login/', {
            'username': self.username
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Missing username
        response = self.client.post('/login/', {
            'password': self.password
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)