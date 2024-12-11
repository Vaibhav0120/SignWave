import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import SignAnimation from '../components/SignAnimation';
import { convertTextToSign } from '../utils/api';

interface TextToSignProps {
  isBackendConnected: boolean;
}

const TextToSign: React.FC<TextToSignProps> = ({ isBackendConnected }) => {
  const [text, setText] = useState<string>('');
  const [animationUrl, setAnimationUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBackendConnected) {
      setError("Cannot convert text. Backend is not connected.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await convertTextToSign(text);
      setAnimationUrl(result);
    } catch (error) {
      console.error('Error converting text to sign:', error);
      setError('Failed to convert text to sign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white text-center">Text to Sign</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="text" className="block text-sm font-medium text-gray-300 mb-2">
            Enter text to convert to sign language:
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !isBackendConnected}
          className="w-full"
        >
          {isLoading ? 'Converting...' : 'Convert to Sign'}
        </Button>
      </form>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {isLoading && <p className="text-gray-300 text-center mb-4">Generating sign language animation...</p>}
      {animationUrl && !isLoading && !error && <SignAnimation animationUrl={animationUrl} />}
    </div>
  );
};

export default TextToSign;

