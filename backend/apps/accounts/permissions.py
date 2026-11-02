from rest_framework import permissions
from .models import CustomUser


class IsFarmer(permissions.BasePermission):
    """
    Permission check ensuring the authenticated user possesses the FARMER role.
    """
    message = "Access restricted to registered farmers only."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == CustomUser.Role.FARMER
        )


class IsBuyer(permissions.BasePermission):
    """
    Permission check ensuring the authenticated user possesses the BUYER role.
    """
    message = "Access restricted to registered buyers only."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == CustomUser.Role.BUYER
        )


class IsAdminUserRole(permissions.BasePermission):
    """
    Permission check ensuring the user is a platform administrator.
    """
    message = "Access restricted to platform administrators."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == CustomUser.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission allowing only the owner or an admin to edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or (request.user.role == CustomUser.Role.ADMIN):
            return True

        # Check common ownership fields
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'farmer') and hasattr(obj.farmer, 'user'):
            return obj.farmer.user == request.user
        if hasattr(obj, 'buyer') and hasattr(obj.buyer, 'user'):
            return obj.buyer.user == request.user

        return False
