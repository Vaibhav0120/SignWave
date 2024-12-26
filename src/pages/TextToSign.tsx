"use client"

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import TranslationLayout from "../components/TranslationLayout";
import { Mic } from 'lucide-react';

interface TextToSignProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
  isSignToText: boolean;
}

interface TranslatedImage {
  src: string;
  count: number;
}

const TextToSign: React.FC<TextToSignProps> = ({
  isDarkMode,
  onSwitchMode,
  isTransitioning,
  animationDirection,
  isSignToText,
}) => {
  const [text, setText] = useState<string>("");
  const [translatedImages, setTranslatedImages] = useState<TranslatedImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const convertToTranslatedImages = (input: string): TranslatedImage[] => {
    const result: TranslatedImage[] = [];
    let currentChar = '';
    let count = 0;

    const processChar = (char: string) => {
      const upperChar = char.toUpperCase();
      if ((upperChar >= "A" && upperChar <= "Z") || (upperChar >= "0" && upperChar <= "9")) {
        return `/images/alphabets/${upperChar}.png`;
      } else if (char === " ") {
        return "/images/alphabets/SPACE.png";
      } else if (char === ",") {
        return "/images/alphabets/COMMA.png";
      } else if (char === ".") {
        return "/images/alphabets/PERIOD.png";
      } else if (char === "?") {
        return "/images/alphabets/QUESTION.png";
      } else if (char === "!") {
        return "/images/alphabets/EXCLAMATION.png";
      } else if (char === "\n") {
        return "/images/alphabets/ENTER.png";
      } else {
        return "/images/alphabets/UNKNOWN.png";
      }
    };

    for (const char of input) {
      const processedChar = processChar(char);
      if (processedChar === currentChar) {
        count++;
      } else {
        if (currentChar) {
          for (let i = 0; i < count; i++) {
            result.push({ src: currentChar, count: i + 1 });
          }
        }
        currentChar = processedChar;
        count = 1;
      }
    }

    if (currentChar) {
      for (let i = 0; i < count; i++) {
        result.push({ src: currentChar, count: i + 1 });
      }
    }

    return result;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isTranslating) {
      setIsTranslating(false);
      return;
    }
    const images = convertToTranslatedImages(text);
    setTranslatedImages(images);
    setCurrentImageIndex(0);
    setIsTranslating(true);
  };

  const handleClear = () => {
    setText("");
    setTranslatedImages([]);
    setCurrentImageIndex(0);
    setIsTranslating(false);
  };

  const handleSpeak = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prevText) => {
          const newText = prevText + transcript;
          return newText.charAt(0) === ' ' ? newText.slice(1) : newText;
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser.');
    }
  }, []);

  useEffect(() => {
    if (isTranslating && translatedImages.length > 0) {
      const intervalId = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          if (prevIndex < translatedImages.length - 1) {
            return prevIndex + 1;
          } else {
            setIsTranslating(false);
            return prevIndex;
          }
        });
      }, 750);

      return () => clearInterval(intervalId);
    }
  }, [isTranslating, translatedImages]);

  const leftContent = (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <div className="flex-grow mb-4">
          <label
            htmlFor="text"
            className={`block text-sm font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            } mb-2`}
          >
            Enter text to translate:
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full h-[calc(100%-5rem)] px-4 py-3 ${
              isDarkMode
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white text-gray-900 border-gray-300"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out border-2`}
            required
            placeholder="Type your text here..."
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={handleClear}
              variant="outline"
              size="sm"
              className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              }`}
            >
              Clear
            </Button>
            <Button
              onClick={handleSpeak}
              variant="outline"
              size="sm"
              className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
              } ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
            <Button
              type="submit"
              size="sm"
              className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                isTranslating
                  ? 'bg-red-500 hover:bg-red-600'
                  : isDarkMode
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isTranslating ? "STOP" : "Translate"}
            </Button>
          </div>
          <div className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Current: {translatedImages[currentImageIndex]?.src.split('/').pop()?.split('.')[0] || ""} (
            {translatedImages.length > 0
              ? `${currentImageIndex + 1}/${translatedImages.length}`
              : "0/0"}
            )
          </div>
        </div>
      </form>
    </div>
  );

  const rightContent = (
    <div className="h-full flex flex-col">
      <h2
        className={`text-xl font-semibold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Sign Language Translation:
      </h2>
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } p-4 rounded-lg h-[calc(100%-5rem)] shadow-inner overflow-hidden flex items-center justify-center border-2 ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {isTranslating && translatedImages.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={translatedImages[currentImageIndex].src}
              alt={`Sign for ${translatedImages[currentImageIndex].src.split('/').pop()?.split('.')[0]}`}
              className="w-full h-full object-contain"
            />
            {translatedImages[currentImageIndex].count > 1 && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-black">
                <span className="text-black font-bold text-sm">
                  {translatedImages[currentImageIndex].count}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p
            className={`text-center ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {translatedImages.length > 0
              ? "Translation complete"
              : "Enter text and click Translate to see sign language images"}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden">
      <h1
        className={`text-3xl font-bold mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        } text-center`}
      >
        Text to Sign
      </h1>
      <TranslationLayout
        isDarkMode={isDarkMode}
        onSwitchMode={onSwitchMode}
        leftContent={leftContent}
        rightContent={rightContent}
        isTransitioning={isTransitioning}
        animationDirection={animationDirection}
        isSignToText={isSignToText}
      />
    </div>
  );
};

export default TextToSign;

