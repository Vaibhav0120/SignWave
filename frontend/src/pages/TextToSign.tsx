import React, { useState } from 'react';
import SignAnimation from '../components/SignAnimation';
import { convertTextToSign } from '../utils/api';

const TextToSign: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [animationUrl, setAnimationUrl] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await convertTextToSign(text);
      setAnimationUrl(result);
    } catch (error) {
      console.error('Error converting text to sign:', error);
      setAnimationUrl('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Text to Sign</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Enter text to convert to sign language:
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Convert to Sign
        </button>
      </form>
      {animationUrl && <SignAnimation animationUrl={animationUrl} />}
    </div>
  );
};

export default TextToSign;