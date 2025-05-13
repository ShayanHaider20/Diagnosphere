
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes to allow requests from the React frontend

# Define the upload folder where temporary images will be saved
app.config['UPLOAD_FOLDER'] = 'uploads'

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load the trained model
# Note: Update the model path to match your actual model path
model_path = os.getenv('MODEL_PATH', 'skin_model_checkpoint.keras')
try:
    model = load_model(model_path)
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Function to preprocess the uploaded image
def preprocess_image(image):
    img_array = img_to_array(image)
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array = preprocess_input(img_array)  # Preprocess the image
    return img_array

# Route for image classification
@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image = request.files['image']
    filename = secure_filename(image.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(image_path)  # Save the uploaded image to a temporary location
    
    try:
        # Ensure model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded properly'}), 500
            
        img = load_img(image_path, target_size=(224, 224))  # Load the image from the temporary location
        img_array = preprocess_image(img)
        
        # Perform classification
        prediction = model.predict(img_array)
        predicted_class = np.argmax(prediction, axis=1)[0]
        
        # Update these class names to match your specific model's classes
        class_titles = ['Eczema', 'Melanoma', 'Psoriasis']
        result = class_titles[predicted_class]
        
        # Get the confidence score
        confidence = float(prediction[0][predicted_class])
        print(f"Predicted class: {result} with confidence {confidence:.2f}")
        
        # Delete the temporary image file
        os.remove(image_path)
        
        return jsonify({
            'result': result,
            'confidence': confidence,
            'predictions': {class_name: float(score) for class_name, score in zip(class_titles, prediction[0])}
        }), 200
        
    except Exception as e:
        print(f"Error during classification: {e}")
        # Try to clean up the file
        if os.path.exists(image_path):
            os.remove(image_path)
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model_loaded': model is not None}), 200

# API routes for the MongoDB functionality
@app.route('/api/auth/login', methods=['POST'])
def login():
    # This is a placeholder that returns a mock response
    return jsonify({
        'token': 'mock-token',
        'user': {
            'id': '123',
            'name': 'Test User',
            'email': 'test@example.com',
        }
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    # This is a placeholder that returns a mock response
    return jsonify({
        'token': 'mock-token',
        'user': {
            'id': '123',
            'name': 'Test User',
            'email': 'test@example.com',
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
