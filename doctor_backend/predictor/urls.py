from django.urls import path
from .views import SymptomCheckAPIView

urlpatterns = [
    path('', SymptomCheckAPIView.as_view(), name='symptom_check_api'),
]