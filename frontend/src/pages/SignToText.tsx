import React, { useState, useRef, useCallback } from "react";
import { Button } from "../components/ui/button";
import CameraOffSign from "../components/CameraOffSign";
import TranslationLayout from "../components/TranslationLayout";
import Alert from "../components/Alert";
import TextToSpeech from "../components/TextToSpeech";

interface SignToTextProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
  isSignToText: boolean;
}

interface AlertInfo {
  message: string;
  details: string;
  type: "success" | "error" | "warning" | "info";
}

const SignToText: React.FC<SignToTextProps> = ({
  isDarkMode,
  onSwitchMode,
  isTransitioning,
  animationDirection,
  isSignToText,
}) => {
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  // Remove these lines
  // const videoRef = useRef<HTMLVideoElement>(null);
  // const canvasRef = useRef<HTMLCanvasElement>(null);
  // const streamRef = useRef<MediaStream | null>(null);

  const addAlert = useCallback((alert: AlertInfo) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]);
    setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(a => a !== alert));
    }, 5000);
  }, []);

  const startTranslation = useCallback(async () => {
    console.log("Start button clicked");
    setIsTranslating(true);
    addAlert({
      message: "Translation started",
      details: "Camera is now on (simulated).",
      type: "info"
    });

    try {
      console.log("Connecting to Flask backend...");
      const response = await fetch('http://localhost:5000/start-translation', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to start translation');
      }
      const data = await response.json();
      console.log('Flask backend connected:', data);

      addAlert({
        message: "Preparing for translation",
        details: "Please wait...",
        type: "info"
      });

      // Simulate a 5-second preparation time
      await new Promise(resolve => setTimeout(resolve, 5000));

      addAlert({
        message: "Translation ready",
        details: "You can now start signing.",
        type: "success"
      });
    } catch (error) {
      console.log('Error starting translation:', error);
      setIsTranslating(false);
    }
  }, [addAlert]);

  const stopTranslation = useCallback(() => {
    setIsTranslating(false);
    addAlert({
      message: "Translation stopped",
      details: "The translation process has been stopped.",
      type: "info"
    });
  }, [addAlert]);

  const toggleTranslation = useCallback(() => {
    if (isTranslating) {
      stopTranslation();
    } else {
      startTranslation();
    }
  }, [isTranslating, startTranslation, stopTranslation]);


  const leftContent = (
    <div className="h-full flex flex-col">
      <div className="relative h-[calc(100%-3rem)] mb-4 bg-black rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <CameraOffSign isOn={isTranslating} />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Button
          variant="default"
          size="sm"
          className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
          onClick={toggleTranslation}
        >
          {isTranslating ? "Stop Translating" : "Start Translating"}
        </Button>
      </div>
    </div>
  );

  const rightContent = (
    <div className="h-full flex flex-col">
      <h2
        className={`text-xl font-semibold mb-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Translated Text:
      </h2>
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } p-4 rounded-lg h-[calc(100%-5rem)] mb-2 shadow-inner overflow-auto border-2 ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <p className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          {translatedText || "Start translating to see the result"}
        </p>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              isDarkMode
                ? "border-gray-600 hover:bg-gray-700"
                : "border-gray-300 hover:bg-gray-100"
            }`}
            onClick={() => setTranslatedText("")}
          >
            Clear
          </Button>
          <TextToSpeech text={translatedText} isDarkMode={isDarkMode} />
        </div>
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
        Sign to Text
      </h1>
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          message={alert.message}
          details={alert.details}
          onClose={() => setAlerts(alerts => alerts.filter(a => a !== alert))}
          isDarkMode={isDarkMode}
          type={alert.type}
        />
      ))}
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

export default SignToText;

