from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
import base64
import traceback
from cvzone.HandTrackingModule import HandDetector
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Load the pre-trained model
model = load_model('cnn8grps_rad1_model.h5')

# Initialize HandDetector
hd = HandDetector(maxHands=1)

def preprocess_image(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blur = cv2.GaussianBlur(gray, (5, 5), 2)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    
    # Resize the image to match the input size of the model
    resized = cv2.resize(thresh, (400, 400))
    
    # Convert to RGB (3 channels)
    rgb = cv2.cvtColor(resized, cv2.COLOR_GRAY2RGB)
    
    return rgb

def detect_hand(image):
    hands, _ = hd.findHands(image, draw=False, flipType=False)
    if hands:
        return hands[0]['bbox']
    return None

@app.route('/api/health-check', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        app.logger.info("Received prediction request")
        data = request.json
        image_data = data['image'].split(',')[1]
        image = cv2.imdecode(np.frombuffer(base64.b64decode(image_data), np.uint8), cv2.IMREAD_COLOR)
        
        app.logger.info(f"Received image shape: {image.shape}")
        
        # Detect hand
        hand_bbox = detect_hand(image)
        
        if hand_bbox:
            app.logger.info(f"Hand detected at: {hand_bbox}")
            x, y, w, h = hand_bbox
            
            # Extract hand region
            hand_img = image[y:y+h, x:x+w]
            
            # Preprocess the image
            processed_img = preprocess_image(hand_img)
            
            # Reshape for model input
            model_input = np.expand_dims(processed_img, axis=0)
            
            # Make prediction
            prediction = model.predict(model_input)
            predicted_class = np.argmax(prediction)
            
            # Convert class to character
            result = chr(predicted_class + 65)
            
            app.logger.info(f"Prediction: {result}")
            
            return jsonify({
                'prediction': result,
                'confidence': float(np.max(prediction)),
                'bbox': hand_bbox
            })
        
        app.logger.warning("No hand detected in the image")
        return jsonify({'error': 'No hand detected'}), 400
    except Exception as e:
        app.logger.error(f"Error in predict: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, threaded=True)