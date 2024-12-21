import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import ReverseButton from "../components/ReverseButton";

interface TextToSignProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
}

const TextToSign: React.FC<TextToSignProps> = ({
  isDarkMode,
  onSwitchMode,
}) => {
  const [text, setText] = useState<string>("");
  const [translatedImages, setTranslatedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const images = text
      .toUpperCase()
      .split("")
      .map((char) => {
        if (char >= "A" && char <= "Z") {
          return `/images/alphabets/${char}.png`;
        }
        return null;
      })
      .filter(Boolean) as string[];
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1
        className={`text-4xl font-bold mb-8 ${
          isDarkMode ? "text-white" : "text-gray-900"
        } text-center`}
      >
        Text to Sign
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="w-full">
          <form onSubmit={handleSubmit} className="mb-6 h-full flex flex-col">
            <div className="relative flex-grow mb-4">
              <label
                htmlFor="text"
                className={`block text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } mb-2`}
              >
                Enter text to translate to sign language:
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full h-[400px] px-4 py-3 ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out`}
                required
                placeholder="Type your text here..."
              />
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={isTranslating}
                  className="bg-green-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
              </div>
              <div className={isDarkMode ? "text-white" : "text-gray-900"}>
                Current: {text[currentImageIndex] || ""} (
                {translatedImages.length > 0
                  ? `${currentImageIndex + 1}/${translatedImages.length}`
                  : "0/0"}
                )
              </div>
            </div>
          </form>
        </div>

        <ReverseButton
          onClick={onSwitchMode}
          isClockwise={false}
          isDarkMode={isDarkMode}
        />

        <div className="w-full">
          <h2
            className={`text-2xl font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Sign Language Translation:
          </h2>
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            } p-4 rounded-lg flex-grow mb-4 shadow-inner overflow-auto h-[400px] flex items-center justify-center`}
          >
            {isTranslating && translatedImages.length > 0 ? (
              <img
                src={translatedImages[currentImageIndex]}
                alt={`Sign for ${text[currentImageIndex]}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <p
                className={`text-xl ${
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
      </div>
    </div>
  );
};

export default TextToSign;
