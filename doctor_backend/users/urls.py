from django.urls import path
from users.views.doctor_view import DoctorListCreateView, DoctorDetailView,DoctorDetailViewForPatients,DoctorDetailSearchForPatients,DoctorCountView
from users.views.auth_view import SignupView, LoginView,VerifyEmailView,ForgotPasswordView,ResetPasswordView
from rest_framework_simplejwt.views import TokenRefreshView
from users.views.patient_view import PatientListCreateView, PatientDetailView, PatientCountView
from users.views.doctor_view import DoctorBySpecializationView,AllDoctorsView
from users.views.patient_view import AllPatientsView


urlpatterns = [
    path('signup/', SignupView.as_view()),
    path('login/', LoginView.as_view()),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('doctors/', DoctorListCreateView.as_view()),
    path('doctors/<int:pk>/', DoctorDetailView.as_view()),
    path('doctors/view/<int:pk>/', DoctorDetailViewForPatients.as_view()),
    path('doctors/search/', DoctorDetailSearchForPatients.as_view()),
    path("doctors/count/", DoctorCountView.as_view(), name="doctor-count"),
    path('doctors/all/', AllDoctorsView.as_view(), name='all-doctors'),

    
    path('patients/', PatientListCreateView.as_view()),
    path('patients/<int:pk>/', PatientDetailView.as_view()),
    path("patients/count/", PatientCountView.as_view(), name="patient-count"), 
    path('patients/all/', AllPatientsView.as_view(), name='all-patients'), 

    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('doctors/by-specialization/', DoctorBySpecializationView.as_view()),

]