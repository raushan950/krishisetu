import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUserManager(BaseUserManager):
    """
    Custom user manager supporting registration with email as the unique identifier.
    """
    def create_user(self, email, phone, full_name, password=None, role='FARMER', **extra_fields):
        if not email:
            raise ValueError('Email address is mandatory.')
        if not phone:
            raise ValueError('Phone number is mandatory.')
        if not full_name:
            raise ValueError('Full name is mandatory.')

        email = self.normalize_email(email).lower()
        extra_fields.setdefault('is_active', True)
        user = self.model(
            email=email,
            phone=phone.strip(),
            full_name=full_name.strip(),
            role=role,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', CustomUser.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, phone, full_name, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Primary user model for KrishiSetu.
    Uses UUID as the primary key and enforces role-based capabilities.
    """
    class Role(models.TextChoices):
        FARMER = 'FARMER', 'Farmer'
        BUYER = 'BUYER', 'Buyer'
        ADMIN = 'ADMIN', 'Administrator'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True, max_length=255)
    phone = models.CharField(unique=True, db_index=True, max_length=15)
    full_name = models.CharField(max_length=150)
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.FARMER,
        db_index=True
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone', 'full_name']

    class Meta:
        db_table = 'accounts_customuser'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()}) - {self.email}"

    @property
    def is_farmer(self):
        return self.role == self.Role.FARMER

    @property
    def is_buyer(self):
        return self.role == self.Role.BUYER

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN or self.is_superuser


class FarmerProfile(models.Model):
    """
    Profile extension specifically for farmers cultivating and selling crops.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='farmer_profile'
    )
    village = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True, db_index=True)
    state = models.CharField(max_length=100, blank=True, db_index=True)
    farm_size_acres = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'farmers_farmerprofile'
        verbose_name = 'Farmer Profile'
        verbose_name_plural = 'Farmer Profiles'

    def __str__(self):
        return f"Farmer: {self.user.full_name} ({self.district}, {self.state})"


class BuyerProfile(models.Model):
    """
    Profile extension specifically for buyers, traders, processors, and retailers.
    """
    class BuyerType(models.TextChoices):
        WHOLESALER = 'WHOLESALER', 'Wholesaler'
        RETAILER = 'RETAILER', 'Retailer'
        PROCESSOR = 'PROCESSOR', 'Food Processor / Mill Owner'
        COMMISSION_AGENT = 'COMMISSION_AGENT', 'Commission Agent (Arhatiya)'
        EXPORTER = 'EXPORTER', 'Exporter'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='buyer_profile'
    )
    business_name = models.CharField(max_length=200, blank=True)
    buyer_type = models.CharField(
        max_length=25,
        choices=BuyerType.choices,
        default=BuyerType.WHOLESALER
    )
    gstin = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True)
    district = models.CharField(max_length=100, blank=True, db_index=True)
    state = models.CharField(max_length=100, blank=True, db_index=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'buyers_buyerprofile'
        verbose_name = 'Buyer Profile'
        verbose_name_plural = 'Buyer Profiles'

    def __str__(self):
        name = self.business_name or self.user.full_name
        return f"Buyer: {name} ({self.get_buyer_type_display()})"


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically instantiate role-specific profile when a new user is created.
    """
    if created:
        if instance.role == CustomUser.Role.FARMER:
            FarmerProfile.objects.get_or_create(user=instance)
        elif instance.role == CustomUser.Role.BUYER:
            BuyerProfile.objects.get_or_create(user=instance)
