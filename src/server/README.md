
# Skin Disease Diagnosis - Flask Backend

This is the Flask backend for the Skin Disease Diagnosis application.

## Setup

1. Make sure you have Python 3.8+ installed
2. Create a virtual environment:
```
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows: 
   ```
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```
   source venv/bin/activate
   ```

4. Install dependencies:
```
pip install -r requirements.txt
```

5. Make sure your model file is placed in this directory and named `skin_model_checkpoint.keras`
   - You can change the model path by setting the `MODEL_PATH` environment variable

## Running the backend

```
python app.py
```

The backend will run on http://localhost:5000

## API Endpoints

- `POST /classify` - Upload an image for classification
  - Request: Form data with `image` field containing the file
  - Response: JSON with prediction results

- `GET /health` - Health check endpoint to verify the service is running

## Testing the API

You can test the API using curl:

```
curl -X POST -F "image=@path/to/your/image.jpg" http://localhost:5000/classify
```

Or use a tool like Postman to send requests.
