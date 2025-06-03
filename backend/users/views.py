# users/views.py
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views import View
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class RegisterView(View):
    def post(self, request):
        data = json.loads(request.body)
        user = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'patient')
        )
        return JsonResponse({'message': 'User registered successfully'}, status=201)

class LoginView(View):
    def post(self, request):
        data = json.loads(request.body)
        user = authenticate(request, email=data['email'], password=data['password'])
        if user is not None:
            login(request, user)
            return JsonResponse({'message': 'Login successful', 'role': user.role})
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({'message': 'Logged out successfully'})
