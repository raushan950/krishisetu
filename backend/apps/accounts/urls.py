from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomLoginView,
    CurrentUserView,
    FarmerProfileView,
    BuyerProfileView,
)

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomLoginView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='auth_current_user'),

    # Profile management endpoints
    path('farmers/profile/', FarmerProfileView.as_view(), name='farmer_profile'),
    path('buyers/profile/', BuyerProfileView.as_view(), name='buyer_profile'),
]
