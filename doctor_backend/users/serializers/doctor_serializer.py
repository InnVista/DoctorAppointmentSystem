# users/serializers/doctor_serializer.py

from rest_framework import serializers
from users.models import CustomUser
import string, random
from django.core.mail import send_mail
from django.conf import settings

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'specialization','is_active'
        ]

    def create(self, validated_data):
        validated_data['role'] = 'doctor'
        password = self.generate_password()

        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            specialization=validated_data.get('specialization', ''),
            password=password,
            is_active=True
        )
        user.role = 'doctor'
        user.save()

        self.send_welcome_email(user.email, user.username, password)
        return user


    def generate_password(self, length=10):
        characters = string.ascii_letters + string.digits + string.punctuation
        return ''.join(random.choice(characters) for _ in range(length))

    def send_welcome_email(self, email, username, password):
        subject = "Welcome to Smart Doctor Appointment System"
        message = f"""
Hello {username},

Your doctor account has been created by the admin.

You can now log in using the following credentials:

Username (email): {email}
Password: {password}

Please log in and change your password after your first login.

Thank you,
Smart Doctor Appointment System
"""
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
