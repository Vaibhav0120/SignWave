import React, { useState } from 'react';

interface TextToSpeechProps {
  text: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ text }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };

  return (
    <button
      onClick={speak}
      disabled={isSpeaking}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
    >
      {isSpeaking ? 'Speaking...' : 'Speak'}
    </button>
  );
};

export default TextToSpeech;

