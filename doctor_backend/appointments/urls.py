from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentCancelView,
    AppointmentStatusView,
    AppointmentNotesView,
    AppointmentStatsView,
    AppointmentCountView,
    AllAppointmentsView
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view()),
    path('<int:pk>/', AppointmentDetailView.as_view()),
    path('<int:pk>/cancel/', AppointmentCancelView.as_view()),
    path('<int:pk>/status/', AppointmentStatusView.as_view()),
    path('<int:pk>/notes/', AppointmentNotesView.as_view()),
    path('stats/', AppointmentStatsView.as_view(), name='appointment-stats'),
    path('count/', AppointmentCountView.as_view(), name='appointment-count'),
    path('all/', AllAppointmentsView.as_view(), name='all-appointments'),
]
