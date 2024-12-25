const API_URL = 'http://localhost:5000/api';

interface PredictionResponse {
  prediction: string;
  handDetected: boolean;
}

export const predictSign = async (imageData: string): Promise<PredictionResponse> => {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: PredictionResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error predicting sign:', error);
    throw error;
  }
};

export const performHandshake = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/handshake`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Error performing handshake:', error);
    return false;
  }
};

