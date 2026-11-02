from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, FarmerProfile, BuyerProfile


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = [
            'id', 'village', 'district', 'state', 'farm_size_acres',
            'preferred_language', 'latitude', 'longitude', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = [
            'id', 'business_name', 'buyer_type', 'gstin', 'address',
            'district', 'state', 'latitude', 'longitude', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class UserDetailSerializer(serializers.ModelSerializer):
    farmer_profile = FarmerProfileSerializer(read_only=True)
    buyer_profile = BuyerProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'phone', 'full_name', 'role',
            'is_active', 'created_at', 'farmer_profile', 'buyer_profile'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_active', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    # Optional initial profile metadata
    village = serializers.CharField(write_only=True, required=False, allow_blank=True)
    district = serializers.CharField(write_only=True, required=False, allow_blank=True)
    state = serializers.CharField(write_only=True, required=False, allow_blank=True)
    farm_size_acres = serializers.DecimalField(max_digits=7, decimal_places=2, write_only=True, required=False, allow_null=True)
    business_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    buyer_type = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gstin = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'phone', 'full_name', 'role', 'password', 'password_confirm',
            'village', 'district', 'state', 'farm_size_acres', 'business_name', 'buyer_type', 'gstin'
        ]
        read_only_fields = ['id']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # Ensure role is valid
        if attrs.get('role') not in [CustomUser.Role.FARMER, CustomUser.Role.BUYER]:
            raise serializers.ValidationError({"role": "Role must be either FARMER or BUYER."})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        village = validated_data.pop('village', '')
        district = validated_data.pop('district', '')
        state = validated_data.pop('state', '')
        farm_size_acres = validated_data.pop('farm_size_acres', None)
        business_name = validated_data.pop('business_name', '')
        buyer_type = validated_data.pop('buyer_type', BuyerProfile.BuyerType.WHOLESALER)
        gstin = validated_data.pop('gstin', '')

        password = validated_data.pop('password')
        user = CustomUser.objects.create_user(
            password=password,
            **validated_data
        )

        # Update initial profile created by post_save signal
        if user.role == CustomUser.Role.FARMER:
            profile = user.farmer_profile
            profile.village = village
            profile.district = district
            profile.state = state
            if farm_size_acres:
                profile.farm_size_acres = farm_size_acres
            profile.save()
        elif user.role == CustomUser.Role.BUYER:
            profile = user.buyer_profile
            profile.business_name = business_name or user.full_name
            profile.district = district
            profile.state = state
            profile.gstin = gstin
            if buyer_type in BuyerProfile.BuyerType.values:
                profile.buyer_type = buyer_type
            profile.save()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Enhanced SimpleJWT serializer that embeds user identity, role, and profile summary in the response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)

        data['user'] = {
            'id': str(self.user.id),
            'email': self.user.email,
            'phone': self.user.phone,
            'full_name': self.user.full_name,
            'role': self.user.role,
        }

        if self.user.role == CustomUser.Role.FARMER and hasattr(self.user, 'farmer_profile'):
            data['user']['profile'] = FarmerProfileSerializer(self.user.farmer_profile).data
        elif self.user.role == CustomUser.Role.BUYER and hasattr(self.user, 'buyer_profile'):
            data['user']['profile'] = BuyerProfileSerializer(self.user.buyer_profile).data
        else:
            data['user']['profile'] = None

        return data
