To start the project:

1. Set up the backend:
   1. Navigate to the `backend` folder
   2. Create a virtual environment: `python -m venv venv`
   3. Activate the virtual environment:
      1. On Windows: `venv\Scripts\activate`
      2. On macOS/Linux: `source venv/bin/activate`
   4. Install the required packages: `pip install flask flask-cors opencv-python cvzone keras tensorflow numpy`
   5. Run the Flask app: `python app.py`
   6. 
2. Set up the frontend:
   1. Navigate to the `frontend` folder
   2. Install dependencies: `npm install`
   3. Start the development server: `npm start`
      
The application should now be running, with the backend on `http://localhost:5000` and the frontend on `http://localhost:3000`.
   
   ```bash
  SignWave/
  ├── frontend/
  │   ├── public/
  │   │   ├── index.html
  │   │   ├── favicon.ico
  │   │   ├── manifest.json
  │   │   └── robots.txt
  │   ├── src/
  │   │   ├── components/
  │   │   │   ├── Navbar.tsx
  │   │   │   ├── Camera.tsx
  │   │   │   ├── TextToSpeech.tsx
  │   │   │   └── SignAnimation.tsx
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
