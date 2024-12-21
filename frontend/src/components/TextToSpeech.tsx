"use client"

import React from 'react';
import { Button } from './ui/button';
import { Volume2 } from 'lucide-react';

interface TextToSpeechProps {
  text: string;
  isDarkMode: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, isDarkMode }) => {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech not supported in this browser.');
    }
  };

  return (
    <Button
      onClick={speak}
      size="sm"
      className={`bg-green-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${
        isDarkMode ? 'hover:bg-green-600' : 'hover:bg-green-400'
      }`}
    >
      <Volume2 className="w-4 h-4 mr-2" />
      Speak
    </Button>
  );
};

export default TextToSpeech;