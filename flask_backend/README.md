
# Flask Backend for Skin Disease Diagnosis

This Flask application serves as the backend for the skin disease diagnosis application, allowing you to use your original Keras model without converting it to TensorFlow.js.

## Setup Instructions

1. Install Python 3.8+ if you don't already have it
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Add your Keras model to this directory (or update the path in app.py)
6. Uncomment the TensorFlow imports and model loading code in app.py
7. Start the server:
   ```bash
   python app.py
   ```
   
The server will run at http://localhost:5000

## API Endpoints

- `POST /api/diagnosis/upload` - Upload an image and get a diagnosis ID
- `POST /api/diagnosis/<diagnosis_id>/analyze` - Analyze uploaded image with provided symptoms
- `GET /api/diagnosis/<diagnosis_id>/results` - Get diagnosis results
- `GET /api/diagnosis/history` - Get history of diagnoses

## Integration with Frontend

This backend is designed to work with the React frontend. Make sure the frontend is configured to send requests to http://localhost:5000/api/.

## Model Integration

To integrate your actual Keras model:

1. Uncomment the TensorFlow/Keras imports at the top of app.py
2. Update the model path in the model loading code
3. Implement the `preprocess_image` and `predict_skin_condition` functions according to your model's requirements
