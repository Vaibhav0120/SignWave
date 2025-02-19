<h1 align="center">SignWave: Sign Language Translator</h1>

<p align="center">SignWave is a web application that bridges communication gaps with sign language translation technology. It offers two main features: Sign to Text and Text to Sign.</p>

<p align="center"><b>NOTE: This project is not complete. There are some bugs I am working on, so SignToText cannot be used in "Watch It Live."</b></p>

To Watch It Live: [Click here!](https://sign-wave-gamma.vercel.app/)

<h2 align="center">Project Overview</h2>

SignWave consists of two main parts:

1. **Frontend**: A React application that provides the user interface.
2. **Backend**: A Python Flask application that handles sign language recognition and text-to-sign conversion.

<h2 align="center">Key Features</h2>

- **Sign to Text**: Translate sign language gestures into text using your device's camera.
- **Text to Sign**: Convert text into sign language animations.
- **Text-to-Speech**: Listen to the translated text.

<h2 align="center">Installation</h2>

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

### Backend Setup

1. Navigate to the project's backend directory:

```bash
cd ../backend
```

2. Install required packages:

```bash
pip install -r requirements.txt
```

<h2 align="center">Running the Application</h2>

To run the SignWave application, you need to start both the frontend and backend servers.

### Starting the Backend Server

1. Ensure you're in the backend directory.
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

<h2 align="center">Screenshots</h2>

<img src="https://media.licdn.com/dms/image/v2/D5622AQEYZSllHvqQkg/feedshare-shrink_2048_1536/B56ZQn47u2HIA0-/0/1735836024994?e=1743033600&v=beta&t=tX7zzqtlYOSI83x6hEfAe-N8Satwu6rLb2lhAr_1vuA">

<img src="https://media.licdn.com/dms/image/v2/D5622AQEGDXJFcCFI-Q/feedshare-shrink_2048_1536/B56ZQn47uLH0As-/0/1735836025329?e=1743033600&v=beta&t=vBRLF67wkPPq3LostWkRoe_iheMWHMYiKIulcEAHZb4">

<img src="https://media.licdn.com/dms/image/v2/D5622AQGDx4lfXPrFyg/feedshare-shrink_2048_1536/B56ZQn47vCH0As-/0/1735836025669?e=1743033600&v=beta&t=iJo4QIx5k24Y4usKv5iMa9RToOatkmDDp05asiyh954">


<h2 align="center">File Structure</h2>

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
│   │           ├── ... (other alphabet images)
│   │           ├── 0.png
│   │           ├── 1.png
│   │           ├── 2.png
│   │           └── ... (other 0- 10images)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Camera.tsx
│   │   │   ├── CameraOffSign.tsx
│   │   │   ├── CursorGradient.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── ReverseButton.tsx
│   │   │   ├── SignAnimation.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── TextToSpeech.tsx
│   │   │   ├── TranslationLayout.tsx
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       └── spinner.tsx
│   │   ├── images/
│   │   │   └── Light_Theme.jpg
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

<h2 align="center">Future Improvements</h2>

1. Implement real-time sign language recognition for continuous translation.
2. Expand the sign language vocabulary recognized by the model.
3. Improve the accuracy of the sign language recognition model.
4. Develop a more comprehensive text-to-sign animation system.
5. Add support for multiple sign languages.
6. Implement user accounts for saving translation history.
7. Create a mobile app version for increased accessibility.
