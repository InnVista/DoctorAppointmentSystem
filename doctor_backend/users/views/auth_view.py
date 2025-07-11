from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers.register_serializer import RegisterSerializer
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import CustomUser
from ..serializers.doctor_serializer import DoctorSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail, BadHeaderError
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password

class SignupView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            verify_url = f"http://127.0.0.1:8000/api/verify-email/{uid}/{token}/"

            try:
                send_mail(
                    subject="Verify your email - Doctor Appointment System",
                    message=f"Click the link to verify your email: {verify_url}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except (BadHeaderError, Exception) as e:
                return Response({"error": f"Email send failed: {str(e)}"}, status=500)

            return Response({"message": "Check your email to verify your account."}, status=201)

        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"message": "Invalid email."}, status=401)

        user = authenticate(username=user.username, password=password)
        if user:
            if not user.is_active:
                return Response({"message": "Please verify your email before logging in."}, status=403)

            refresh = RefreshToken.for_user(user)
            outputdat = DoctorSerializer(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": user.role,
                "message": "Login successful",
                "user": outputdat.data
            })

        return Response({"message": "Invalid credentials."}, status=401)

class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_object_or_404(CustomUser, pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": "Email verified. You can now log in."})
            else:
                return Response({"message": "Invalid or expired link."}, status=400)

        except Exception:
            return Response({"message": "Invalid request."}, status=400)

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")

        try:
            user = CustomUser.objects.get(email=email)
            if not user.is_active:
                return Response({"message": "Please verify your email first."}, status=403)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"http://127.0.0.1:8000/frontend/reset-password.html?uid={uid}&token={token}"

            send_mail(
                subject="Reset your password - Doctor Appointment System",
                message=f"Click the link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            return Response({"message": "Password reset link sent. Check your email."}, status=200)

        except CustomUser.DoesNotExist:
            return Response({"message": "No account found with this email."}, status=404)
        except BadHeaderError:
            return Response({"message": "Invalid email header."}, status=500)

class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        password = request.data.get("password")

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = CustomUser.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.password = make_password(password)
                user.save()
                return Response({"message": "Password reset successful."}, status=200)
            else:
                return Response({"message": "Invalid or expired reset link."}, status=400)

        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"message": "Invalid reset request."}, status=400)
