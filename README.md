# SignWave: Sign Language Translator

SignWave is a web application that bridges communication gaps with sign language translation technology. It offers two main features: Sign to Text and Text to Sign.

## Table of Contents

1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Installation](#installation)
4. [Running the Application](#running-the-application)
5. [How It Works](#how-it-works)
6. [Component Breakdown](#component-breakdown)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)
9. [Future Improvements](#future-improvements)

## Project Overview

SignWave consists of two main parts:

1. **Frontend**: A React application that provides the user interface.
2. **Backend**: A Python Flask application that handles sign language recognition and text-to-sign conversion.

### Key Features

- **Sign to Text**: Translate sign language gestures into text using your device's camera.
- **Text to Sign**: Convert text into sign language animations.
- **Text-to-Speech**: Listen to the translated text.

## File Structure

```bash
SignWave/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── images/
│   │       ├── Sign_Language.png
│   │       └── alphabets/
│   │           ├── A.png
│   │           ├── B.png
│   │           └── ... (other alphabet images)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Camera.tsx
│   │   │   ├── CursorGradient.tsx
│   │   │   ├── TextToSpeech.tsx
│   │   │   ├── SignAnimation.tsx
│   │   │   └── ReverseButton.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── SignToText.tsx
│   │   │   └── TextToSign.tsx
│   │   ├── utils/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── backend/
│   ├── app.py
│   └── cnn8grps_rad1_model.h5
├── .gitignore
└── README.md

```

## Installation

Follow these steps to set up the SignWave project on your local machine:

### Prerequisites

- Node.js (v14 or later)
- Python (v3.7 or later)
- pip (Python package installer)
- Git (for cloning the repository)

### Cloning the Repository

1. Open a terminal or command prompt.
2. Clone the repository:

```bash
git clone [https://github.com/Vaibhav0120/SignWave.git](https://github.com/Vaibhav0120/SignWave.git)
```

```bash
cd SignWave
```


### Frontend Setup

1. Navigate to the project's frontend directory:

```bash
cd frontend
```

2. Install the required Node.js packages:

```bash
npm install
```
```bash

npm install @radix-ui/react-slot class-variance-authority tailwindcss-animate
```

```bash
npm install clsx tailwind-merge
```

```bash
npm install lucide-react
```


```bash
npm install lodash @types/lodash
```

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Backend Setup

1. Navigate to the project's backend directory:

```bash
cd ../backend
```

2. Create a Python virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:
- On Windows:

```bash
venv\Scripts\activate
```

- On macOS and Linux:

```bash
source venv/bin/activate
```

4. Install the required Python packages:

First Time Installing dependency (for DEVs)-
```bash
pip install flask flask-cors opencv-python numpy tensorflow cvzone mediapipe
```

```bash
pip freeze > requirements.txt
```

For Everyone Install Project First Time-

```bash
pip install -r requirements.txt
```

## Running the Application

To run the SignWave application, you need to start both the frontend and backend servers.

### Starting the Backend Server

1. Ensure you're in the backend directory and the virtual environment is activated.
2. Run the Flask application:

```bash
python app.py
```

The backend server should start running on `http://localhost:5000`.

### Starting the Frontend Server

1. Open a new terminal or command prompt.
2. Navigate to the frontend directory.
3. Start the React development server:

```bash
npm start
```

The frontend should open automatically in your default web browser at `http://localhost:3000`.

## How It Works

### Frontend

- `App.tsx`: The main component that sets up routing and includes the Navbar.
- `index.tsx`: The entry point of the application that renders the App component.
- `index.css`: Contains global styles and Tailwind CSS imports.
- `components/`: Contains reusable components like Navbar, Camera, TextToSpeech, and SignAnimation.
- `pages/`: Contains the main pages of the application (Home, SignToText, and TextToSign).
- `utils/api.ts`: Handles API calls to the backend.

### Backend

- `app.py`: The Flask application that handles sign language recognition and text-to-sign conversion.
- `cnn8grps_rad1_model.h5`: A pre-trained machine learning model for sign language recognition.

### User Flow

1. **Home Page**: Users can choose between Sign to Text and Text to Sign features.
2. **Sign to Text**:
- The Camera component captures video from the user's device.
- When the user clicks "Capture", the image is sent to the backend for processing.
- The backend uses the pre-trained model to recognize the sign and returns the predicted text.
- The result is displayed, and users can use the TextToSpeech component to hear the prediction.
3. **Text to Sign**:
- Users enter text in the input field.
- When submitted, the text is sent to the backend for processing.
- The backend generates a sign language animation (currently a placeholder).
- The SignAnimation component displays the resulting animation.

## Component Breakdown

### Navbar.tsx
- Provides navigation links to Home, Sign to Text, and Text to Sign pages.
- Uses React Router for navigation.

### Camera.tsx
- Accesses the user's camera using the `navigator.mediaDevices.getUserMedia` API.
- Provides a "Capture" button to take a snapshot of the current camera feed.
- Sends the captured image data to the parent component for processing.

### TextToSpeech.tsx
- Utilizes the Web Speech API to convert text to speech.
- Provides a "Speak" button to trigger the text-to-speech functionality.

### SignAnimation.tsx
- Displays a video element with the sign language animation.
- Takes an `animationUrl` prop to set the video source.

### Home.tsx
- Serves as the landing page for the application.
- Provides links to the Sign to Text and Text to Sign features.

### SignToText.tsx
- Integrates the Camera and TextToSpeech components.
- Handles the logic for sending captured images to the backend and displaying results.

### TextToSign.tsx
- Provides a form for users to input text.
- Handles the logic for sending text to the backend and displaying the resulting animation.

## API Endpoints

### POST /api/predict
- Accepts an image of a sign language gesture.
- Returns the predicted text representation of the sign.

### POST /api/text-to-sign
- Accepts a text string.
- Returns a URL to an animation representing the text in sign language.

## Troubleshooting

- If you encounter any issues with dependencies, try deleting the `node_modules` folder in the frontend directory and the `venv` folder in the backend directory, then repeat the installation steps.
- Ensure that your device has a working camera for the Sign to Text feature.
- If the backend server fails to start, make sure you have the correct Python version and all required packages installed.
- For any other issues, check the browser console (frontend) or terminal (backend) for error messages.

Common issues and solutions:
1. **Camera not working**: Ensure you've granted the necessary permissions in your browser settings.
2. **Backend connection error**: Check if the backend server is running and the API_URL in `api.ts` is correct.
3. **Missing dependencies**: Run `npm install` in the frontend directory and `pip install -r requirements.txt` in the backend directory.

## Future Improvements

1. Implement real-time sign language recognition for continuous translation.
2. Expand the sign language vocabulary recognized by the model.
3. Improve the accuracy of the sign language recognition model.
4. Develop a more comprehensive text-to-sign animation system.
5. Add support for multiple sign languages.
6. Implement user accounts for saving translation history.
7. Create a mobile app version for increased accessibility.
