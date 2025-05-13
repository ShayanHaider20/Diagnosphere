
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array, load_img
import numpy as np
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define the upload folder where temporary images will be saved
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global variable to store the model
model = None

# Load the model
def load_keras_model():
    global model
    try:
        model = load_model('skin_model_checkpoint.keras')
        print("Model loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Function to preprocess the uploaded image
def preprocess_image(image_path):
    img = load_img(image_path, target_size=(224, 224))  # Adjust size if needed
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0  # Normalize pixel values
    return img_array

@app.route('/api/load-model', methods=['GET'])
def load_model_endpoint():
    success = load_keras_model()
    if success:
        return jsonify({"status": "success", "message": "Model loaded successfully"})
    else:
        return jsonify({"status": "error", "message": "Failed to load model"}), 500

@app.route('/api/diagnose', methods=['POST'])
def diagnose():
    global model
    if model is None:
        load_keras_model()
        if model is None:
            return jsonify({"status": "error", "message": "Model not loaded"}), 500
    
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image provided"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
        
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        # Preprocess the image
        preprocessed_img = preprocess_image(filepath)
        
        # Get prediction
        prediction = model.predict(preprocessed_img)
        
        # Map the prediction to class labels
        class_names = ['eczema', 'melanoma', 'psoriasis']  # Update these based on your model classes
        predicted_class_index = np.argmax(prediction[0])
        predicted_class = class_names[predicted_class_index]
        confidence = float(prediction[0][predicted_class_index]) * 100
        
        # Clean up
        os.remove(filepath)
        
        # Return prediction
        return jsonify({
            "status": "success",
            "prediction": predicted_class,
            "confidence": confidence,
            "all_predictions": {
                "eczema": float(prediction[0][0]) * 100,
                "melanoma": float(prediction[0][1]) * 100,
                "psoriasis": float(prediction[0][2]) * 100
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
