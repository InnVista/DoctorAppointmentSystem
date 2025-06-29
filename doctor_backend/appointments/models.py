from django.db import models
from django.utils import timezone
from users.models import CustomUser

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('started', 'Started'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )

    patient = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='appointments_as_patient',
        limit_choices_to={'role': 'patient'}
    )
    doctor = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='appointments_as_doctor',
        limit_choices_to={'role': 'doctor'}
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()

    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True, null=True)

    start_time = models.DateTimeField(blank=True, null=True)
    
    end_time = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    patient_name = models.CharField(max_length=120,blank=True, null=True)
    doctor_name = models.CharField(max_length=120,blank=True, null=True)

    def calculate_duration(self):
        if self.start_time and self.end_time:
            duration = (self.end_time - self.start_time).total_seconds() / 60
            self.duration_minutes = int(duration)
            self.save()
    def save(self, *args, **kwargs):
        if self.patient:
            self.patient_name = f"{self.patient.first_name} {self.patient.last_name}".strip()
        if self.doctor:
            self.doctor_name = f"Dr. {self.doctor.first_name} {self.doctor.last_name}".strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.appointment_date} at {self.appointment_time}"

