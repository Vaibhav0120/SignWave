"use client"

import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import TranslationLayout from "../components/TranslationLayout";

interface TextToSignProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
}

const TextToSign: React.FC<TextToSignProps> = ({
  isDarkMode,
  onSwitchMode,
  isTransitioning,
  animationDirection,
}) => {
  const [text, setText] = useState<string>("");
  const [translatedImages, setTranslatedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = text
      .split("")
      .map((char) => {
        const upperChar = char.toUpperCase();
        if (upperChar >= "A" && upperChar <= "Z") {
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
        } else {
          return "/images/alphabets/UNKNOWN.png";
        }
      });
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
            className={`w-full h-[calc(100%-4rem)] px-4 py-3 ${
              isDarkMode
                ? "bg-gray-700 text-white"
                : "bg-gray-100 text-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out`}
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
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isTranslating}
              size="sm"
              className="bg-green-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          </div>
          <div className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Current: {text[currentImageIndex] || ""} (
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
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        } p-4 rounded-lg flex-grow shadow-inner overflow-hidden flex items-center justify-center`}
      >
        {isTranslating && translatedImages.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={translatedImages[currentImageIndex]}
              alt={`Sign for ${text[currentImageIndex]}`}
              className="w-full h-full object-contain"
            />
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
    <>
      <h1
        className={`text-3xl font-bold mb-6 ${
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
      />
    </>
  );
};

export default TextToSign;

