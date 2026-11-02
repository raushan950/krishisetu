from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import CustomUser, FarmerProfile, BuyerProfile


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.farmer_register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.token_refresh_url = reverse('auth_token_refresh')
        self.me_url = reverse('auth_current_user')
        self.farmer_profile_url = reverse('farmer_profile')
        self.buyer_profile_url = reverse('buyer_profile')

        self.farmer_data = {
            "email": "ramesh.farmer@example.com",
            "phone": "9876543210",
            "full_name": "Ramesh Kumar",
            "role": "FARMER",
            "password": "FarmerPassword@123",
            "password_confirm": "FarmerPassword@123",
            "village": "Pipliya",
            "district": "Neemuch",
            "state": "Madhya Pradesh",
            "farm_size_acres": "12.50"
        }

        self.buyer_data = {
            "email": "sharma.traders@example.com",
            "phone": "9123456780",
            "full_name": "Suresh Sharma",
            "role": "BUYER",
            "password": "BuyerPassword@123",
            "password_confirm": "BuyerPassword@123",
            "business_name": "Sharma Agro Traders",
            "buyer_type": "WHOLESALER",
            "district": "Indore",
            "state": "Madhya Pradesh",
            "gstin": "23ABCDE1234F1Z5"
        }

    def test_farmer_registration(self):
        """Test successful registration of a farmer and profile generation."""
        response = self.client.post(self.farmer_register_url, self.farmer_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], "ramesh.farmer@example.com")
        self.assertEqual(response.data['user']['role'], "FARMER")

        # Verify database record
        user = CustomUser.objects.get(email="ramesh.farmer@example.com")
        self.assertTrue(hasattr(user, 'farmer_profile'))
        self.assertEqual(user.farmer_profile.district, "Neemuch")
        self.assertEqual(str(user.farmer_profile.farm_size_acres), "12.50")

    def test_buyer_registration(self):
        """Test successful registration of a buyer and profile generation."""
        response = self.client.post(self.farmer_register_url, self.buyer_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], "BUYER")

        # Verify database record
        user = CustomUser.objects.get(email="sharma.traders@example.com")
        self.assertTrue(hasattr(user, 'buyer_profile'))
        self.assertEqual(user.buyer_profile.business_name, "Sharma Agro Traders")

    def test_registration_password_mismatch(self):
        """Test that mismatched passwords return 400 Bad Request."""
        invalid_data = self.farmer_data.copy()
        invalid_data['password_confirm'] = "Mismatch@123"
        response = self.client.post(self.farmer_register_url, invalid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_login_and_jwt_payload(self):
        """Test user login returns access/refresh tokens and user identity payload."""
        # Register user first
        self.client.post(self.farmer_register_url, self.farmer_data, format='json')

        # Login
        login_payload = {
            "email": "ramesh.farmer@example.com",
            "password": "FarmerPassword@123"
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], "FARMER")
        self.assertEqual(response.data['user']['profile']['district'], "Neemuch")

    def test_token_refresh(self):
        """Test refreshing access token using refresh token."""
        reg_response = self.client.post(self.farmer_register_url, self.farmer_data, format='json')
        refresh_token = reg_response.data['tokens']['refresh']

        response = self.client.post(self.token_refresh_url, {"refresh": refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_current_user_me_endpoint(self):
        """Test authenticated GET /api/v1/auth/me/."""
        reg_response = self.client.post(self.farmer_register_url, self.farmer_data, format='json')
        access_token = reg_response.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "ramesh.farmer@example.com")
        self.assertEqual(response.data['farmer_profile']['village'], "Pipliya")

    def test_role_based_permission_enforcement(self):
        """Test that farmers cannot access buyer profile endpoints and vice-versa."""
        farmer_reg = self.client.post(self.farmer_register_url, self.farmer_data, format='json')
        farmer_token = farmer_reg.data['tokens']['access']

        buyer_reg = self.client.post(self.farmer_register_url, self.buyer_data, format='json')
        buyer_token = buyer_reg.data['tokens']['access']

        # Farmer accessing farmer profile -> 200 OK
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {farmer_token}')
        response = self.client.get(self.farmer_profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Farmer accessing buyer profile -> 403 FORBIDDEN
        response = self.client.get(self.buyer_profile_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Buyer accessing buyer profile -> 200 OK
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {buyer_token}')
        response = self.client.get(self.buyer_profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Buyer accessing farmer profile -> 403 FORBIDDEN
        response = self.client.get(self.farmer_profile_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class HealthCheckTests(APITestCase):
    def test_health_check_confirms_database_connectivity(self):
        response = self.client.get(reverse('health_check'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_temporary_frontend_origin_is_allowed_for_api_requests(self):
        response = self.client.options(
            reverse('auth_login'),
            HTTP_ORIGIN='https://instant-geode-9y9nkbl.tmp.now',
            HTTP_ACCESS_CONTROL_REQUEST_METHOD='POST',
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS='content-type',
        )

        self.assertEqual(
            response['Access-Control-Allow-Origin'],
            'https://instant-geode-9y9nkbl.tmp.now',
        )
