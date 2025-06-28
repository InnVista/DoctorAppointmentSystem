from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    )
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=10,choices=GENDER_CHOICES, blank=True, null=True)
    address = models.CharField(max_length=200, blank=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact=models.CharField(max_length=15, blank=True)
    dob = models.DateField(blank=True, null=True)  

    def __str__(self):
        return f"{self.username} ({self.role})"

