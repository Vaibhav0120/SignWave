from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
import base64
import traceback

app = Flask(__name__)
CORS(app)

# Load the pre-trained model
model = load_model('cnn8grps_rad1_model.h5')

def detect_hand(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Apply threshold
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # Assume the largest contour is the hand
        hand_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(hand_contour)
        return x, y, w, h
    
    return None

@app.route('/api/health-check', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        image_data = data['image'].split(',')[1]
        image = cv2.imdecode(np.frombuffer(base64.b64decode(image_data), np.uint8), cv2.IMREAD_COLOR)
        
        # Detect hand
        hand_bbox = detect_hand(image)
        
        if hand_bbox:
            x, y, w, h = hand_bbox
            
            # Extract hand region
            hand_img = image[y:y+h, x:x+w]
            
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
    except Exception as e:
        print(f"Error in predict: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/text-to-sign', methods=['POST'])
def text_to_sign():
    data = request.json
    text = data['text']
    
    # TODO: Implement text to sign language conversion
    # For now, we'll return a placeholder response
    return jsonify({'animationUrl': 'https://example.com/placeholder-animation.mp4'})

if __name__ == '__main__':
    app.run(debug=True)

