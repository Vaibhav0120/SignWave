from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import io
from PIL import Image
import tensorflow as tf
from cvzone.HandTrackingModule import HandDetector
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load your trained model here
model = tf.keras.models.load_model('cnn8grps_rad1_model.h5')
logger.info("Model loaded successfully")

# Initialize HandDetector
hd = HandDetector(maxHands=1, detectionCon=0.8)
logger.info("HandDetector initialized")

# Define your classes
classes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

@app.route('/api/handshake', methods=['GET'])
def handshake():
    logger.info("Received handshake request")
    return jsonify({'status': 'ok'})

@app.route('/api/predict', methods=['POST'])
def predict():
    logger.info("Received prediction request")
    try:
        # Get the image and hand tracking flag from the POST request
        data = request.json
        img_data = data['image']
        is_hand_tracking_on = data['isHandTrackingOn']
        logger.info(f"Hand tracking is {'on' if is_hand_tracking_on else 'off'}")
        
        # Decode the base64 image
        img_data = img_data.split(',')[1]  # Remove the "data:image/jpeg;base64," part
        img = Image.open(io.BytesIO(base64.b64decode(img_data)))
        logger.info("Image decoded successfully")
        
        # Convert PIL Image to cv2 image
        img_cv2 = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Find hands in the image
        hands, img_cv2 = hd.findHands(img_cv2, draw=False)
        
        if hands:
            logger.info("Hand detected in the image")
            hand = hands[0]
            x, y, w, h = hand['bbox']
            
            # Crop the hand region
            hand_img = img_cv2[y-20:y+h+20, x-20:x+w+20]
            
            # Create a white image for drawing hand landmarks
            white = np.ones((400, 400, 3), dtype=np.uint8) * 255
            
            # Draw hand landmarks on white image
            for lm in hand['lmList']:
                cv2.circle(white, (int(lm[0]-x+20), int(lm[1]-y+20)), 5, (0, 0, 255), cv2.FILLED)
            
            # Preprocess the image for prediction
            white = cv2.resize(white, (28, 28))
            white = cv2.cvtColor(white, cv2.COLOR_BGR2GRAY)
            white = white.reshape(1, 28, 28, 1)
            white = white / 255.0
            
            # Make prediction
            prediction = model.predict(white)
            predicted_class = classes[np.argmax(prediction)]
            logger.info(f"Predicted class: {predicted_class}")
            
            response = {'prediction': predicted_class}
            
            # If hand tracking is on, include hand landmarks in the response
            if is_hand_tracking_on:
                response['handLandmarks'] = hand['lmList']
            
            return jsonify(response)
        else:
            logger.info("No hand detected in the image")
            return jsonify({'prediction': 'No hand detected'}), 200  # Changed to 200 status
    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        error_message = "Unable to process the image. Please try again."
        return jsonify({'error': error_message}), 400

if __name__ == '__main__':
    app.run(debug=True)

