import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "../components/ui/button";

interface HomeProps {
  isDarkMode: boolean;
}

const Home: React.FC<HomeProps> = ({ isDarkMode }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to SignWave</h1>
        <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bridging communication gaps with sign language translation technology.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
        <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-purple-400'} p-8 rounded-lg shadow-lg`}>
          <h2 className="text-3xl font-semibold mb-4 text-white">Sign to Text</h2>
          <p className="mb-6 text-gray-100">Translate sign language gestures into text using your camera. Perfect for those who want to understand sign language.</p>
          <Link to="/sign-to-text">
            <Button variant="secondary">Try Sign to Text</Button>
          </Link>
        </div>
        <div className={`${isDarkMode ? 'bg-gradient-to-br from-green-600 to-teal-600' : 'bg-gradient-to-br from-green-400 to-teal-400'} p-8 rounded-lg shadow-lg`}>
          <h2 className="text-3xl font-semibold mb-4 text-white">Text to Sign</h2>
          <p className="mb-6 text-gray-100">Convert text into sign language animations. Ideal for learning sign language or communicating with sign language users.</p>
          <Link to="/text-to-sign">
            <Button variant="secondary">Try Text to Sign</Button>
          </Link>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-8 rounded-lg shadow-lg mb-12`}>
        <h2 className={`text-3xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Why Choose SignWave?</h2>
        <ul className={`list-disc list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
          <li>Real-time sign language translation</li>
          <li>User-friendly interface for easy communication</li>
          <li>Text-to-speech functionality for audio output</li>
          <li>Supports both sign-to-text and text-to-sign conversion</li>
          <li>Helps bridge the communication gap for the deaf and hard of hearing community</li>
        </ul>
      </div>

      <div className="text-center">
        <img src="/images/Sign_Language.png" alt="A to Z Sign Language" className="mx-auto rounded-lg shadow-lg mb-8" style={{maxWidth: '60%', height: 'auto'}} />
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Experience the power of SignWave in action!</p>
      </div>
    </div>
  );
};

export default Home;
