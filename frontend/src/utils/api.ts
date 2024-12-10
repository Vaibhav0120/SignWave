const API_URL = 'http://localhost:5000/api';

export const predictSign = async (imageData: string): Promise<string> => {
  const response = await fetch(`${API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData }),
  });

  if (!response.ok) {
    throw new Error('Failed to predict sign');
  }

  const data = await response.json();
  return data.prediction;
};

export const convertTextToSign = async (text: string): Promise<string> => {
  const response = await fetch(`${API_URL}/text-to-sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to convert text to sign');
  }

  const data = await response.json();
  return data.animationUrl;
};