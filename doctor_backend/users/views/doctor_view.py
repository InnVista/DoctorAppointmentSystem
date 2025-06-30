from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import CustomUser
from django.db.models import Q
from users.serializers.doctor_serializer import DoctorSerializer
from rest_framework.response import Response
from rest_framework import status as drf_status
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
import re

class IsAdminUserRole(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'


class DoctorListCreateView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        search_query = request.query_params.get('search', '')

        doctors = CustomUser.objects.filter(role='doctor')
        if search_query:
            doctors = doctors.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(specialization__icontains=search_query)
            )
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(doctors, request)
        serializer = DoctorSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)


    def post(self, request):
        email = request.data.get("email")
        doctor = CustomUser.objects.filter(email=email).first()
        if(doctor):
            return Response("Email already used", status=400)
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class DoctorDetailViewForPatients(APIView):

    def get_object(self, pk):
        return CustomUser.objects.get(pk=pk, role='doctor')

    def get(self, request, pk):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

class DoctorDetailSearchForPatients(APIView):    
    def get(self, request):
        search_query = request.query_params.get('search', '')

        doctors = CustomUser.objects.filter(role='doctor')
        if search_query:
            doctors = doctors.filter(
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(specialization__icontains=search_query)
            )

        paginator = PageNumberPagination()
        paginator.page_size = 10  # Adjust page size as needed
        result_page = paginator.paginate_queryset(doctors, request)
        serializer = DoctorSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)


class DoctorDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get_object(self, pk):
        return CustomUser.objects.get(pk=pk, role='doctor')

    def get(self, request, pk):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    def put(self, request, pk):
        doctor = self.get_object(pk)
        data = request.data.copy()  
        email = data.get('email')
        if email:
            email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
            if not re.match(email_regex, email):
                return Response({"email": "Invalid email format."}, status=drf_status.HTTP_400_BAD_REQUEST)
            if CustomUser.objects.filter(email=email).exclude(id=doctor.id).exists():
                return Response({"email": "email Already exists."}, status=drf_status.HTTP_400_BAD_REQUEST)
        serializer = DoctorSerializer(doctor, data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        doctor = self.get_object(pk)
        data = request.data.copy()  
        email = data.get('email')
        # Update is_active based on status value
        status_value = data.get('status')
        if status_value is not None:
            if status_value == "Inactive":
                data['is_active'] = False
            else:
                data['is_active'] = True
        serializer = DoctorSerializer(doctor, data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        doctor = self.get_object(pk)
        doctor.delete()
        return Response({"message": "Doctor deleted successfully."})
