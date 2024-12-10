import React, { useState } from 'react';
import Camera from '../components/Camera';
import TextToSpeech from '../components/TextToSpeech';
import { predictSign } from '../utils/api';

const SignToText: React.FC = () => {
  const [prediction, setPrediction] = useState<string>('');

  const handleCapture = async (imageData: string) => {
    try {
      const result = await predictSign(imageData);
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting sign:', error);
      setPrediction('Error occurred while predicting sign');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sign to Text</h1>
      <div className="mb-6">
        <Camera onCapture={handleCapture} />
      </div>
      {prediction && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Prediction:</h2>
          <p className="text-xl mb-4">{prediction}</p>
          <TextToSpeech text={prediction} />
        </div>
      )}
    </div>
  );
};

export default SignToText;