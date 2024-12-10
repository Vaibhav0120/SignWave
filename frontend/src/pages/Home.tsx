import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Sign Language Translator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Sign to Text</h2>
          <p className="mb-4">Translate sign language gestures into text using your camera.</p>
          <Link to="/sign-to-text" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Try Sign to Text</Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Text to Sign</h2>
          <p className="mb-4">Convert text into sign language animations.</p>
          <Link to="/text-to-sign" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Try Text to Sign</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;