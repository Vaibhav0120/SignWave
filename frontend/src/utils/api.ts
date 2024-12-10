const API_URL = 'http://localhost:5000/api';

interface PredictionResponse {
  prediction: string;
}

interface AnimationResponse {
  animationUrl: string;
}

export const predictSign = async (imageData: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PredictionResponse = await response.json();
    return data.prediction;
  } catch (error) {
    console.error('Error predicting sign:', error);
    throw new Error('Failed to predict sign');
  }
};

export const convertTextToSign = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/text-to-sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AnimationResponse = await response.json();
    return data.animationUrl;
  } catch (error) {
    console.error('Error converting text to sign:', error);
    throw new Error('Failed to convert text to sign');
  }
};

