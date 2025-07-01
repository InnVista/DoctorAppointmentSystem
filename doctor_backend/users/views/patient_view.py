from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import CustomUser
from users.serializers.patient_serializer import PatientSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework import status

class PatientPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

class PatientListCreateView(APIView):

    def get(self, request):
        patients = CustomUser.objects.filter(role='patient').order_by('id')
        paginator = PatientPagination()
        result_page = paginator.paginate_queryset(patients, request)
        serializer = PatientSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)


    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class PatientDetailView(APIView):

    def get_object(self, pk):
        return CustomUser.objects.get(pk=pk, role='patient')

    def get(self, request, pk):
        patient = self.get_object(pk)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def put(self, request, pk):
        patient = self.get_object(pk)
        serializer = PatientSerializer(patient, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        patient = self.get_object(pk)
        status_value = request.data.get("status")
        if status_value is not None:
            request.data["is_active"] = status_value != "Inactive"
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        patient = self.get_object(pk)
        patient.delete()
        return Response({"message": "Patient deleted successfully."})
class PatientCountView(APIView):

    def get(self, request):
        count = CustomUser.objects.filter(role='patient').count()
        return Response({"total_patients": count}, status=status.HTTP_200_OK)


class AllPatientsView(APIView):
    def get(self, request):
        patients = CustomUser.objects.filter(role='patient')
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)
