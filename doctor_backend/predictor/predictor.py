# your_app/predictor.py

import joblib
import pandas as pd
from django.conf import settings
import os


MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml_model')


try:
    pipeline = joblib.load(os.path.join(MODEL_PATH, 'disease_predictor_pipeline.joblib'))
    label_encoder = joblib.load(os.path.join(MODEL_PATH, 'disease_label_encoder.joblib'))
    symptom_severity_df = pd.read_csv(os.path.join(MODEL_PATH, 'Symptom-severity.csv'))

    symptom_severity_df['Symptom'] = symptom_severity_df['Symptom'].str.strip().str.lower()
    symptom_to_severity = pd.Series(symptom_severity_df.weight.values, index=symptom_severity_df.Symptom).to_dict()

    feature_names = pipeline.named_steps['classifier'].feature_names_in_

    symptom_to_code = {symptom.lower().strip(): i for i, symptom in enumerate(symptom_severity_df['Symptom'].unique())}
    symptom_to_code['no_symptom'] = -1

except FileNotFoundError as e:
    raise RuntimeError(f"Could not load model assets from {MODEL_PATH}. Error: {e}")

def predict_disease(user_symptoms: list):
    """
    Takes a list of user symptoms, processes them into the format the model expects,
    and returns a predicted disease name.
    """
    user_symptoms = [s.strip().lower() for s in user_symptoms]
    
    input_data = {col: [0] for col in feature_names}
    df = pd.DataFrame(input_data)
    
    total_severity = 0
    symptom_slots = [col for col in feature_names if 'Symptom_' in col]
    
    for i, symptom in enumerate(user_symptoms):
        if i < len(symptom_slots):
            slot = symptom_slots[i]
            
            df.loc[0, slot] = symptom_to_code.get(symptom, -1)
            
            severity = symptom_to_severity.get(symptom, 0)
            total_severity += severity
            
            weight_slot_name = f'weight_{slot}'
            if i == 0 and 'weight' in df.columns:
                df.loc[0, 'weight'] = severity
            elif weight_slot_name in df.columns:
                df.loc[0, weight_slot_name] = severity

    for i in range(len(user_symptoms), len(symptom_slots)):
        slot = symptom_slots[i]
        df.loc[0, slot] = symptom_to_code['no_symptom']
    
    if 'Total_Severity' in df.columns:
        df.loc[0, 'Total_Severity'] = total_severity

    df = df[feature_names]
    
    prediction_code = pipeline.predict(df)
    
    
    predicted_disease = label_encoder.inverse_transform(prediction_code)

    return predicted_disease[0]