import sys
import json
import xgboost as xgb
import numpy as np
import os

MAPPINGS = {
    "Gender": {"Female": 0, "Male": 1},
    "Country": {
        "Australia": 0, "Belgium": 1, "Canada": 4, "Germany": 13, 
        "India": 15, "United Kingdom": 33, "United States": 34
    },
    "Occupation": {"Business": 0, "Corporate": 1, "Housewife": 2, "Others": 3, "Student": 4},
    "self_employed": {"No": 0, "Yes": 1},
    "family_history": {"No": 0, "Yes": 1},
    "Days_Indoors": {
        "1-14 days": 0, "15-30 days": 1, "31-60 days": 2, 
        "Go out Every day": 3, "More than 2 months": 4
    },
    "Growing_Stress": {"Maybe": 0, "No": 1, "Yes": 2},
    "Changes_Habits": {"Maybe": 0, "No": 1, "Yes": 2},
    "Mental_Health_History": {"Maybe": 0, "No": 1, "Yes": 2},
    "Mood_Swings": {"High": 0, "Low": 1, "Medium": 2},
    "Coping_Struggles": {"No": 0, "Yes": 1},
    "Work_Interest": {"Maybe": 0, "No": 1, "Yes": 2},
    "Social_Weakness": {"Maybe": 0, "No": 1, "Yes": 2},
    "mental_health_interview": {"Maybe": 0, "No": 1, "Yes": 2},
    "care_options": {"No": 0, "Not sure": 1, "Yes": 2}
}

FEATURE_NAMES = [
    "Gender", "Country", "Occupation", "self_employed", "family_history", 
    "Days_Indoors", "Growing_Stress", "Changes_Habits", "Mental_Health_History", 
    "Mood_Swings", "Coping_Struggles", "Work_Interest", "Social_Weakness", 
    "mental_health_interview", "care_options"
]

def run_prediction():
    try:
        # THE FIX: Read the file that Node.js dropped off!
        if not os.path.exists('latest_assessment.json'):
            print(json.dumps({"error": "latest_assessment.json not found"}))
            return

        with open('latest_assessment.json', 'r') as f:
            input_data = json.load(f)

        ordered_features = [
            MAPPINGS["Gender"].get(input_data.get("Gender"), 1),
            MAPPINGS["Country"].get(input_data.get("Country"), 34),
            MAPPINGS["Occupation"].get(input_data.get("Occupation"), 3),
            MAPPINGS["self_employed"].get(input_data.get("self_employed"), 0),
            MAPPINGS["family_history"].get(input_data.get("family_history"), 0),
            MAPPINGS["Days_Indoors"].get(input_data.get("Days_Indoors"), 0),
            MAPPINGS["Growing_Stress"].get(input_data.get("Growing_Stress"), 0),
            MAPPINGS["Changes_Habits"].get(input_data.get("Changes_Habits"), 0),
            MAPPINGS["Mental_Health_History"].get(input_data.get("Mental_Health_History"), 0),
            MAPPINGS["Mood_Swings"].get(input_data.get("Mood_Swings"), 0),
            MAPPINGS["Coping_Struggles"].get(input_data.get("Coping_Struggles"), 0),
            MAPPINGS["Work_Interest"].get(input_data.get("Work_Interest"), 0),
            MAPPINGS["Social_Weakness"].get(input_data.get("Social_Weakness"), 0),
            MAPPINGS["mental_health_interview"].get(input_data.get("mental_health_interview"), 0),
            MAPPINGS["care_options"].get(input_data.get("care_options"), 0)
        ]

        model = xgb.Booster()
        model.load_model('ml_model/model.json')

        data_matrix = xgb.DMatrix([ordered_features], feature_names=FEATURE_NAMES)
        prediction = model.predict(data_matrix)
        
        final_result = 1 if prediction[0] > 0.5 else 0
        print(json.dumps({"result": final_result}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    run_prediction()