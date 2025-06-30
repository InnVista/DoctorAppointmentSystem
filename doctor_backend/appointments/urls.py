from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentCancelView,
    AppointmentStatusView,
    AppointmentNotesView,
    AppointmentStatsView
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view()),
    path('<int:pk>/', AppointmentDetailView.as_view()),
    path('<int:pk>/cancel/', AppointmentCancelView.as_view()),
    path('<int:pk>/status/', AppointmentStatusView.as_view()),
    path('<int:pk>/notes/', AppointmentNotesView.as_view()),
    path('stats/', AppointmentStatsView.as_view(), name='appointment-stats'),
]
