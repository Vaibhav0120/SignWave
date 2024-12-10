from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from cvzone.HandTrackingModule import HandDetector
from keras.models import load_model
import base64

app = Flask(__name__)
CORS(app)

# Load the pre-trained model
model = load_model('cnn8grps_rad1_model.h5')

# Initialize HandDetector
hd = HandDetector(maxHands=1)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    image_data = data['image'].split(',')[1]
    image = cv2.imdecode(np.frombuffer(base64.b64decode(image_data), np.uint8), cv2.IMREAD_COLOR)
    
    # Process the image
    hands = hd.findHands(image, draw=False, flipType=True)
    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']
        
        # Extract hand region
        hand_img = image[y-30:y+h+30, x-30:x+w+30]
        
        # Preprocess the image
        gray = cv2.cvtColor(hand_img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 2)
        th3 = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
        ret, test_image = cv2.threshold(th3, 27, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Resize and reshape for model input
        test_image = cv2.resize(test_image, (400, 400))
        test_image = np.reshape(test_image, (1, 400, 400, 1))
        
        # Make prediction
        prediction = model.predict(test_image)
        predicted_class = np.argmax(prediction)
        
        # Convert class to character
        result = chr(predicted_class + 65)
        
        return jsonify({'prediction': result})
    
    return jsonify({'prediction': 'No hand detected'})

@app.route('/api/text-to-sign', methods=['POST'])
def text_to_sign():
    data = request.json
    text = data['text']
    
    # TODO: Implement text to sign language conversion
    # For now, we'll return a placeholder response
    return jsonify({'animationUrl': 'https://example.com/placeholder-animation.mp4'})

if __name__ == '__main__':
    app.run(debug=True)

