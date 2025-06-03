# users/decorators.py
from django.http import JsonResponse

def role_required(required_role):
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            if request.user.is_authenticated and request.user.role == required_role:
                return view_func(request, *args, **kwargs)
            return JsonResponse({'error': 'Unauthorized'}, status=403)
        return wrapper
    return decorator
