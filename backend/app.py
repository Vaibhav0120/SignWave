from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from keras.models import load_model
import base64
import traceback
from cvzone.HandTrackingModule import HandDetector

app = Flask(__name__)
CORS(app)

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
    
    return resized

def detect_hand(image):
    hands = hd.findHands(image, draw=False, flipType=True)
    if hands:
        hand = hands[0]
        bbox = hand['bbox']
        return bbox
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
            processed_img = preprocess_image(hand_img)
            
            # Reshape for model input
            model_input = np.reshape(processed_img, (1, 400, 400, 1))
            
            # Make prediction
            prediction = model.predict(model_input)
            predicted_class = np.argmax(prediction)
            
            # Convert class to character
            result = chr(predicted_class + 65)
            
            # Create a copy of the image for drawing
            output_image = image.copy()
            
            # Draw bounding box and predicted character
            cv2.rectangle(output_image, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(output_image, result, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            # Encode the output image
            _, buffer = cv2.imencode('.jpg', output_image)
            output_image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            return jsonify({
                'prediction': result,
                'confidence': float(np.max(prediction)),
                'image': f"data:image/jpeg;base64,{output_image_base64}"
            })
        
        return jsonify({'error': 'No hand detected'}), 400
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

