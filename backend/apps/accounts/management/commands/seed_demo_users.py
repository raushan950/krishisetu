from django.core.management.base import BaseCommand
from apps.accounts.models import CustomUser, FarmerProfile, BuyerProfile


class Command(BaseCommand):
    help = 'Seeds initial demonstration accounts for Hackathon evaluation (Farmer, Buyer, Admin)'

    def handle(self, *args, **options):
        # 1. Create Farmer
        farmer_email = "ramesh.farmer@example.com"
        farmer, created = CustomUser.objects.get_or_create(
            email=farmer_email,
            defaults={
                'phone': '9876543210',
                'full_name': 'Ramesh Kumar Patel',
                'role': CustomUser.Role.FARMER,
                'is_active': True,
            }
        )
        farmer.set_password("FarmerPassword@123")
        farmer.save()

        f_profile, _ = FarmerProfile.objects.get_or_create(user=farmer)
        f_profile.village = "Pipliya Mandi"
        f_profile.district = "Neemuch"
        f_profile.state = "Madhya Pradesh"
        f_profile.farm_size_acres = 12.50
        f_profile.latitude = 24.4631
        f_profile.longitude = 74.8732
        f_profile.save()

        self.stdout.write(self.style.SUCCESS(f"Farmer demo user ready: {farmer_email} / FarmerPassword@123"))

        # 2. Create Buyer
        buyer_email = "sharma.traders@example.com"
        buyer, created = CustomUser.objects.get_or_create(
            email=buyer_email,
            defaults={
                'phone': '9123456780',
                'full_name': 'Suresh Sharma',
                'role': CustomUser.Role.BUYER,
                'is_active': True,
            }
        )
        buyer.set_password("BuyerPassword@123")
        buyer.save()

        b_profile, _ = BuyerProfile.objects.get_or_create(user=buyer)
        b_profile.business_name = "Sharma Agro Commodities Pvt Ltd"
        b_profile.buyer_type = BuyerProfile.BuyerType.WHOLESALER
        b_profile.district = "Indore"
        b_profile.state = "Madhya Pradesh"
        b_profile.gstin = "23ABCDE1234F1Z5"
        b_profile.latitude = 22.7196
        b_profile.longitude = 75.8577
        b_profile.save()

        self.stdout.write(self.style.SUCCESS(f"Buyer demo user ready: {buyer_email} / BuyerPassword@123"))

        # 3. Create Admin / Superuser
        admin_email = "admin@krishisetu.gov.in"
        admin, created = CustomUser.objects.get_or_create(
            email=admin_email,
            defaults={
                'phone': '9999999999',
                'full_name': 'KrishiSetu Admin',
                'role': CustomUser.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
            }
        )
        admin.set_password("AdminPassword@123")
        admin.save()

        self.stdout.write(self.style.SUCCESS(f"Admin user ready: {admin_email} / AdminPassword@123"))
