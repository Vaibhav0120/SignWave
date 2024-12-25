export const performHandshake = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5000/api/handshake', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Error during handshake:', error);
    return false;
  }
};

