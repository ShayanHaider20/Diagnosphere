
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import time
# Import your ML libraries here
# import tensorflow as tf
# from tensorflow import keras
# import numpy as np
# from PIL import Image
# import io

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create upload folder if it doesn't exist
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Dictionary to store diagnoses (in a real app, use a database)
diagnoses = {}

# Load your model here
# model = keras.models.load_model('path_to_your_keras_model.keras')

# Function to preprocess image for model
def preprocess_image(image_path):
    # Implement preprocessing logic based on your model requirements
    # For example:
    # img = Image.open(image_path)
    # img = img.resize((224, 224))
    # img_array = np.array(img) / 255.0
    # img_array = np.expand_dims(img_array, axis=0)
    # return img_array
    pass

# Function to run prediction
def predict_skin_condition(image_path, symptoms):
    # Implement your model prediction logic
    # preprocessed_img = preprocess_image(image_path)
    # prediction = model.predict(preprocessed_img)
    # Get the predicted class and confidence scores
    
    # For now, return a mock result
    mock_conditions = [
        {
            "name": "Eczema (Atopic Dermatitis)",
            "probability": 87,
            "severity": "Moderate",
            "description": "A chronic inflammatory skin condition characterized by dry, itchy, and inflamed skin. It often appears in patches and can cause significant discomfort.",
            "nextSteps": [
                "Consult with a dermatologist for proper evaluation and treatment plan",
                "Avoid triggers such as harsh soaps, certain fabrics, and extreme temperatures",
                "Keep skin moisturized with fragrance-free emollients",
                "Apply prescribed topical medications as directed"
            ],
            "treatments": [
                "Topical corticosteroids to reduce inflammation",
                "Calcineurin inhibitors (tacrolimus, pimecrolimus)",
                "Moisturizers and emollients to maintain skin hydration",
                "Antihistamines for itching relief",
                "Phototherapy for severe cases"
            ]
        },
        {
            "name": "Contact Dermatitis",
            "probability": 42,
            "severity": "Mild",
            "description": "An inflammatory skin condition resulting from contact with allergens or irritants. It causes redness, itching, and sometimes blistering at the site of contact.",
            "nextSteps": [
                "Identify and avoid potential allergens or irritants",
                "Use hypoallergenic products for skin care and cleaning",
                "Apply cool compresses to relieve symptoms",
                "Consider patch testing to identify specific allergens"
            ],
            "treatments": [
                "Topical corticosteroids for inflammation reduction",
                "Barrier creams to protect skin from irritants",
                "Oral antihistamines for itching",
                "Calamine lotion for symptom relief"
            ]
        }
    ]
    
    # Integrate symptoms into the analysis
    # In a real implementation, you would use symptoms to refine the diagnosis
    if symptoms.get('itchLevel', 0) > 7:
        mock_conditions[0]["probability"] += 5
    
    return mock_conditions

@app.route('/api/diagnosis/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
        
    image = request.files['image']
    if image.filename == '':
        return jsonify({'error': 'No image selected'}), 400
        
    # Generate unique ID for this diagnosis
    diagnosis_id = str(uuid.uuid4())
    
    # Save the image
    image_filename = f"{diagnosis_id}_{image.filename}"
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
    image.save(image_path)
    
    # Store diagnosis data
    diagnoses[diagnosis_id] = {
        'id': diagnosis_id,
        'image_path': image_path,
        'date': time.time(),
        'status': 'uploaded'
    }
    
    return jsonify({
        'success': True,
        'diagnosisId': diagnosis_id,
        'message': 'Image uploaded successfully'
    })

@app.route('/api/diagnosis/<diagnosis_id>/analyze', methods=['POST'])
def analyze_skin_condition(diagnosis_id):
    if diagnosis_id not in diagnoses:
        return jsonify({'error': 'Diagnosis not found'}), 404
    
    # Check if we have the image already
    diagnosis = diagnoses[diagnosis_id]
    image_path = diagnosis.get('image_path')
    
    # If image is re-uploaded, save it again
    if 'image' in request.files:
        image = request.files['image']
        if image.filename != '':
            image_filename = f"{diagnosis_id}_{image.filename}"
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)
            image.save(image_path)
            diagnosis['image_path'] = image_path
    
    # Extract symptom data from form
    symptoms = {}
    for key in request.form:
        if key.endswith('[]'):
            # Handle arrays
            base_key = key[:-2]
            if base_key not in symptoms:
                symptoms[base_key] = []
            symptoms[base_key].append(request.form.get(key))
        else:
            symptoms[key] = request.form.get(key)
    
    # Process the image with the model
    conditions = predict_skin_condition(image_path, symptoms)
    
    # Update diagnosis data
    diagnoses[diagnosis_id].update({
        'conditions': conditions,
        'symptoms': symptoms,
        'status': 'completed',
        'date': time.time(),
        'image_url': f"/uploads/{os.path.basename(image_path)}",  # For demo; in production use proper URL
        'patientInfo': {
            'age': 34,  # Mock data
            'gender': "Not specified",
            'skinType': "Not specified",
        },
        'analysisDetails': {
            'areaAffected': "Not specified",
            'duration': symptoms.get('duration', 'Not specified'),
            'characteristics': []
        }
    })
    
    return jsonify({
        'success': True,
        'diagnosisId': diagnosis_id,
        'message': 'Analysis completed'
    })

@app.route('/api/diagnosis/<diagnosis_id>/results', methods=['GET'])
def get_diagnosis_results(diagnosis_id):
    if diagnosis_id not in diagnoses:
        return jsonify({'error': 'Diagnosis not found'}), 404
    
    diagnosis = diagnoses[diagnosis_id]
    if diagnosis['status'] != 'completed':
        return jsonify({'error': 'Diagnosis not yet completed'}), 400
    
    # Return the diagnosis results
    return jsonify(diagnosis)

@app.route('/api/diagnosis/history', methods=['GET'])
def get_diagnosis_history():
    # In a real app, filter by user ID from authentication
    history = [
        {
            'id': diagnosis_id,
            'date': data['date'],
            'status': data['status'],
            'primaryCondition': data.get('conditions', [{}])[0].get('name', 'Unknown') if data.get('conditions') else 'Unknown'
        }
        for diagnosis_id, data in diagnoses.items()
        if data['status'] == 'completed'
    ]
    
    return jsonify(history)

if __name__ == '__main__':
    print("Starting Flask backend on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
