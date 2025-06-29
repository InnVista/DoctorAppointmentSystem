from rest_framework import serializers
from .models import Appointment
from datetime import date

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'start_time', 'end_time', 'duration_minutes']

    def validate(self, data):
        patient = data.get('patient')
        doctor = data.get('doctor')
        appt_date = data.get('appointment_date')

        if patient.role != 'patient':
            raise serializers.ValidationError("Selected user is not a patient.")
        if doctor.role != 'doctor':
            raise serializers.ValidationError("Selected user is not a doctor.")
        if appt_date < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")

        return data
