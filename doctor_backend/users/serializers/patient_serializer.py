from rest_framework import serializers
from users.models import CustomUser

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'role','gender','phone','address','emergency_contact','dob','date_joined']
        extra_kwargs = {
            'role': {'read_only': True}
        }

    def create(self, validated_data):
        validated_data['role'] = 'patient'
        return super().create(validated_data)
