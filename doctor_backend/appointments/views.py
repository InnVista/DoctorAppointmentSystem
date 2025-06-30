from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import get_object_or_404
from .models import Appointment
from .serializers import AppointmentSerializer
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from collections import defaultdict
from calendar import month_name

@method_decorator(csrf_exempt, name='dispatch')
class AppointmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'doctor':
            appointments = Appointment.objects.filter(doctor=user).order_by('-appointment_date', '-appointment_time')
        elif user.role == 'patient':
            appointments = Appointment.objects.filter(patient=user).order_by('-appointment_date', '-appointment_time')
        else:
            appointments = Appointment.objects.all().order_by('-appointment_date', '-appointment_time')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    def put(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)

        # Only allow rescheduling (date & time change) to reset to 'scheduled'
        new_date = request.data.get("appointment_date")
        new_time = request.data.get("appointment_time")

        if new_date and new_time:
            appointment.appointment_date = new_date
            appointment.appointment_time = new_time
            appointment.status = 'scheduled'
            appointment.save()
            return Response({
                "message": "Appointment rescheduled successfully.",
                "data": AppointmentSerializer(appointment).data
            })

        serializer = AppointmentSerializer(appointment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def patch(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        notes = request.data.get("notes")
        reason = request.data.get("reason")
        updated =False
        if notes is not None:
            appointment.notes = notes
            updated=True
        if reason is not None:
            appointment.reason = reason
            updated=True
        if(updated):
            appointment.save()
            return Response({
                "message": "Notes updated successfully.",
                "data": AppointmentSerializer(appointment).data
            })
        return Response({"error": "No notes provided."}, status=400)
    def delete(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        appointment.delete()
        return Response({"message": "Appointment deleted."})

@method_decorator(csrf_exempt, name='dispatch')
class AppointmentCancelView(APIView):
    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        appointment.status = 'cancelled'
        appointment.save()
        return Response({"message": "Appointment cancelled."})

@method_decorator(csrf_exempt, name='dispatch')
class AppointmentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        new_status = request.data.get("status")

        if new_status not in dict(Appointment.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=400)

        if new_status == "started":
            if appointment.status != "confirmed":
                return Response({"error": "Only confirmed appointments can be started."}, status=400)
            appointment.start_time = timezone.now()

        elif new_status == "completed":
            if appointment.status != "started" or not appointment.start_time:
                return Response({"error": "Appointment must be started before completing."}, status=400)
            appointment.end_time = timezone.now()
            appointment.calculate_duration()

        elif new_status == "scheduled":
            return Response({"error": "Cannot manually change to scheduled. Please use PUT to reschedule."}, status=400)

        appointment.status = new_status
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

@method_decorator(csrf_exempt, name='dispatch')
class AppointmentNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        notes = request.data.get("notes", "")
        appointment.notes = notes
        appointment.save()
        return Response({"message": "Notes saved successfully."})

class AppointmentStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()

        # Filter by role
        if user.role == 'patient':
            queryset = Appointment.objects.filter(patient=user)
        elif user.role == 'doctor':
            queryset = Appointment.objects.filter(doctor=user)
        else:
            queryset = Appointment.objects.all()

        # 1. Count of upcoming
        upcoming = queryset.filter(appointment_date__gte=today, status__in=["scheduled", "confirmed"]).count()

        # 2. Last visit (completed appointments)
        last_visit_obj = queryset.filter(status="completed").order_by('-appointment_date').first()
        last_visit = last_visit_obj.appointment_date.strftime('%d %B %Y') if last_visit_obj else "N/A"

        # 3. Monthly stats
        monthly = defaultdict(int)
        for appt in queryset:
            key = appt.appointment_date.strftime('%b')
            monthly[key] += 1

        # Sorted by month order (Jan, Feb, ...)
        ordered_months = [month_name[i][:3] for i in range(1, 13)]
        monthly_data = [{"month": m, "count": monthly[m]} for m in ordered_months if monthly[m] > 0]

        return Response({
            "upcoming": upcoming,
            "lastVisit": last_visit,
            "monthlyHistory": monthly_data
        })