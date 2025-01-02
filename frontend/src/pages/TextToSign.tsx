"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import TranslationLayout from "../components/TranslationLayout";
import { Mic } from "lucide-react";

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
  const [translatedImages, setTranslatedImages] = useState<TranslatedImage[]>(
    []
  );
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const convertToTranslatedImages = (input: string): TranslatedImage[] => {
    const result: TranslatedImage[] = [];
    const words = input.toLowerCase().split(/\s+/);

    const specialWords: { [key: string]: string } = {
      "you're welcome": "/images/special/youre_welcome.png",
      please: "/images/special/please.png",
      thanks: "/images/special/thank_you.png",
      no: "/images/special/no.png",
      yes: "/images/special/yes.png",
      hello: "/images/special/hello.png",
      sorry: "/images/special/sorry.png",
      help: "/images/special/help.png",
      more: "/images/special/more.png",
      goodbye: "/images/special/goodbye.png",
      "excuse me": "/images/special/excuse_me.png",
      sign: "/images/special/sign.png",
      fingerspell: "/images/special/fingerspell.png",
      okay: "/images/special/okay.png",
      time: "/images/special/time.png",

      share: "/images/special/share.png",
      can: "/images/special/can.png",
      use: "/images/special/use.png",
      tell: "/images/special/tell.png",
      try: "/images/special/try.png",
      find: "/images/special/find.png",
      say: "/images/special/say.png",
      need: "/images/special/need.png",
      for: "/images/special/for.png",
      ask: "/images/special/ask.png",
      see: "/images/special/see.png",
      want: "/images/special/want.png",
      meet: "/images/special/meet.png",
      nice: "/images/special/nice.png",
      will: "/images/special/will.png",

      asl: "/images/special/asl.png",
      deaf: "/images/special/deaf.png",
      love: "/images/special/love.png",
      "i love you": "/images/special/i_love_you.png",
      mother: "/images/special/mother.png",
      father: "/images/special/father.png",
      baby: "/images/special/baby.png",
      friend: "/images/special/friend.png",
      school: "/images/special/school.png",
      bathroom: "/images/special/bathroom.png",

      where: "/images/special/where.png",
      why: "/images/special/why.png",
      which: "/images/special/which.png",
      but: "/images/special/but.png",
      different: "/images/special/different.png",
      same: "/images/special/same.png",
      again: "/images/special/again.png",
      also: "/images/special/also.png",
      now: "/images/special/now.png",
      later: "/images/special/later.png",
      not: "/images/special/not.png",
      who: "/images/special/who.png",
      when: "/images/special/when.png",
      how: "/images/special/how.png",
      what: "/images/special/what.png",

      hers: "/images/special/its.png",
      his: "/images/special/its.png",
      its: "/images/special/its.png",
      your: "/images/special/your.png",
      yours: "/images/special/your.png",
      mine: "/images/special/mine.png",
      he: "/images/special/he.png",
      she: "/images/special/she.png",
      it: "/images/special/it.png",
      you: "/images/special/you.png",
      me: "/images/special/me.png",
      with: "/images/special/with.png",
      we: "/images/special/us.png",
      us: "/images/special/us.png",
      our: "/images/special/our.png",
      ours: "/images/special/our.png",
      this: "/images/special/this.png",
      that: "/images/special/that.png",
      these: "/images/special/these.png",
      those: "/images/special/those.png",
      they: "/images/special/they.png",
      theirs: "/images/special/that.png",
    };

    const processChar = (char: string) => {
      const upperChar = char.toUpperCase();
      if (
        (upperChar >= "A" && upperChar <= "Z") ||
        (upperChar >= "0" && upperChar <= "9")
      ) {
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

    for (const word of words) {
      if (specialWords[word]) {
        result.push({ src: specialWords[word], count: 1 });
      } else {
        for (const char of word) {
          result.push({ src: processChar(char), count: 1 });
        }
      }
      if (word !== words[words.length - 1]) {
        result.push({ src: "/images/alphabets/SPACE.png", count: 1 });
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
    if ("webkitSpeechRecognition" in window) {
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
          return newText.charAt(0) === " " ? newText.slice(1) : newText;
        });
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert("Speech recognition is not supported in your browser.");
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
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              Clear
            </Button>
            <Button
              onClick={handleSpeak}
              variant="outline"
              size="sm"
              className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-100"
              } ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
            >
              <Mic
                className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`}
              />
            </Button>
            <Button
              type="submit"
              size="sm"
              className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                isTranslating
                  ? "bg-red-500 hover:bg-red-600"
                  : isDarkMode
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-500 hover:bg-green-600"
              } text-white`}
            >
              {isTranslating ? "STOP" : "Translate"}
            </Button>
          </div>
          <div
            className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Current:{" "}
            {translatedImages[currentImageIndex]?.src
              .split("/")
              .pop()
              ?.split(".")[0] || ""}{" "}
            (
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
              alt={`Sign for ${
                translatedImages[currentImageIndex].src
                  .split("/")
                  .pop()
                  ?.split(".")[0]
              }`}
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
