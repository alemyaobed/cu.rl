from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsFreeUser(BasePermission):
    """
    Allows access only to authenticated users who are not guests.
    """

    message = "Guest users are not authorized to perform this action. Please sign up to continue."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            not getattr(request.user, 'is_guest', False)
        )


class IsAdminOrReadOnly(BasePermission):
    """
    The request is authenticated as an admin, or is a read-only request.
    """

    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and
            request.user.is_staff
        )
