from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import io
from PIL import Image
import tensorflow as tf
import logging
import os

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the full path to the model file
model_path = os.path.join(current_dir, 'sign_language_model.h5')

# Load your trained model
model = tf.keras.models.load_model(model_path)
logger.info(f"Model loaded successfully from {model_path}")

# Define your classes (assuming 36 classes as per the training data)
classes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
           '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']  # Adjust if your classes are different

@app.route('/api/handshake', methods=['GET'])
def handshake():
    logger.info("Received handshake request")
    return jsonify({'status': 'ok'})

@app.route('/api/predict', methods=['POST'])
def predict():
    logger.info("Received prediction request")
    try:
        # Get the image from the POST request
        data = request.json
        img_data = data['image']
        
        # Decode the base64 image
        img_data = img_data.split(',')[1]  # Remove the "data:image/jpeg;base64," part
        img = Image.open(io.BytesIO(base64.b64decode(img_data)))
        logger.info("Image decoded successfully")
        
        # Preprocess the image
        preprocessed_img = preprocess_image(img)
        
        # Make prediction
        prediction = model.predict(preprocessed_img)
        predicted_class = classes[np.argmax(prediction)]
        confidence = float(np.max(prediction))
        logger.info(f"Predicted class: {predicted_class}, Confidence: {confidence:.2f}")
        
        return jsonify({
            'prediction': predicted_class,
            'confidence': confidence,
            'handDetected': True  # Assuming hand detection is handled by the model
        })
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({'error': f"Unable to process the image. Error: {str(e)}"}), 400

def preprocess_image(img):
    # Convert PIL Image to numpy array
    img_array = np.array(img)
    
    # Resize to 64x64 (matching the model's input size)
    resized = cv2.resize(img_array, (64, 64), interpolation=cv2.INTER_AREA)
    
    # Ensure the image has 3 channels (RGB)
    if len(resized.shape) == 2:
        resized = cv2.cvtColor(resized, cv2.COLOR_GRAY2RGB)
    elif resized.shape[2] == 4:
        resized = cv2.cvtColor(resized, cv2.COLOR_RGBA2RGB)
    
    # Normalize
    normalized = resized / 255.0
    
    # Reshape for the model (add batch dimension)
    return np.expand_dims(normalized, axis=0)

if __name__ == '__main__':
    app.run(debug=True)

