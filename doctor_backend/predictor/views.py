# # your_app/views.py


import os
import joblib
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml_model')
try:
    model = joblib.load(os.path.join(MODEL_DIR, 'disease_prediction_model_v3.joblib'))
    label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder_v3.joblib'))
    training_columns = joblib.load(os.path.join(MODEL_DIR, 'training_columns_v3.joblib'))
    print(" Successfully loaded BEST PRACTICES v3 model and files.")
except FileNotFoundError as e:
    model = label_encoder = training_columns = None
    print(f" FATAL ERROR: Could not load v3 model components: {e}")


DISEASE_DOCTOR_MAPPING = {
    'fungal infection': ['Dermatologist', 'General Physician'],
    'allergy': ['Allergist', 'General Physician'],
    'gerd': ['Gastroenterologist'],
    'chronic cholestasis': ['Gastroenterologist', 'Hepatologist'],
    'drug reaction': ['Dermatologist', 'Allergist'],
    'peptic ulcer diseae': ['Gastroenterologist'],
    'aids': ['Infectious Disease Specialist'],
    'diabetes': ['Endocrinologist', 'General Physician'],
    'gastroenteritis': ['Gastroenterologist', 'General Physician'],
    'bronchial asthma': ['Pulmonologist'],
    'hypertension': ['Cardiologist', 'General Physician'],
    'migraine': ['Neurologist', 'General Physician'],
    'cervical spondylosis': ['Orthopedist', 'Neurologist'],
    'paralysis (brain hemorrhage)': ['Neurologist', 'Neurosurgeon'],
    'jaundice': ['Gastroenterologist', 'Hepatologist'],
    'malaria': ['Infectious Disease Specialist', 'General Physician'],
    'chicken pox': ['Pediatrician', 'General Physician', 'Dermatologist'],
    'dengue': ['Infectious Disease Specialist', 'General Physician'],
    'typhoid': ['Infectious Disease Specialist', 'General Physician'],
    'hepatitis a': ['Hepatologist', 'Gastroenterologist'],
    'hepatitis b': ['Hepatologist', 'Gastroenterologist', 'Infectious Disease Specialist'],
    'hepatitis c': ['Hepatologist', 'Gastroenterologist', 'Infectious Disease Specialist'],
    'hepatitis d': ['Hepatologist', 'Gastroenterologist', 'Infectious Disease Specialist'],
    'hepatitis e': ['Hepatologist', 'Gastroenterologist'],
    'alcoholic hepatitis': ['Hepatologist', 'Gastroenterologist'],
    'tuberculosis': ['Pulmonologist', 'Infectious Disease Specialist'],
    'common cold': ['General Physician'],
    'pneumonia': ['Pulmonologist', 'General Physician'],
    'dimorphic hemmorhoids(piles)': ['Proctologist', 'Gastroenterologist'],
    'heart attack': ['Cardiologist', 'Emergency Medicine Physician'],
    'varicose veins': ['Vascular Surgeon', 'Phlebologist'],
    'hypothyroidism': ['Endocrinologist'],
    'hyperthyroidism': ['Endocrinologist'],
    'hypoglycemia': ['Endocrinologist'],
    'osteoarthristis': ['Orthopedist', 'Rheumatologist'],
    'arthritis': ['Rheumatologist'],
    '(vertigo) paroymsal positional vertigo': ['ENT Specialist', 'Neurologist'],
    'acne': ['Dermatologist'],
    'urinary tract infection': ['Urologist', 'General Physician'],
    'psoriasis': ['Dermatologist'],
    'impetigo': ['Dermatologist', 'Pediatrician', 'General Physician']
}

class SymptomCheckAPIView(APIView):
    def post(self, request, *args, **kwargs):
        if not all([model, label_encoder, training_columns is not None]):
            return Response({"error": "Model v3 components not loaded. Check server logs."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        symptoms = request.data.get("symptoms", [])
        if not isinstance(symptoms, list) or not symptoms:
            return Response({"error": "Please provide symptoms as a non-empty list."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            
            input_df = pd.DataFrame(0, index=[0], columns=training_columns)

            matched_symptoms = []
            unmatched_symptoms = []

            for symptom in symptoms:
                
                symptom_key = symptom.strip().lower().replace(' ', '_')

                if symptom_key in training_columns:
                    input_df.at[0, symptom_key] = 1
                    matched_symptoms.append(symptom)
                else:
                    unmatched_symptoms.append(symptom)
            
            if not matched_symptoms:
                 return Response({
                     "error": "None of the provided symptoms could be matched to the model's vocabulary.",
                     "unmatched_symptoms": unmatched_symptoms
                 }, status=status.HTTP_400_BAD_REQUEST)

            prediction_encoded = model.predict(input_df)
            predicted_disease = label_encoder.inverse_transform(prediction_encoded)[0]

            disease_key = predicted_disease.strip().lower()
            recommended_doctors = DISEASE_DOCTOR_MAPPING.get(disease_key, ["General Physician"])

            return Response({
                "predicted_disease": predicted_disease,
                "recommended_doctors": recommended_doctors,
                "matched_symptoms": matched_symptoms,
                "unmatched_symptoms": unmatched_symptoms
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)