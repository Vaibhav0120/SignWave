"use client"

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import TextToSpeech from "../components/TextToSpeech";
import CameraOffSign from "../components/CameraOffSign";
import TranslationLayout from "../components/TranslationLayout";
import { Spinner } from '../components/ui/spinner';
import Alert from '../components/Alert';

interface SignToTextProps {
  isBackendConnected: boolean;
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
  isSignToText: boolean;
}

const SignToText: React.FC<SignToTextProps> = ({
  isBackendConnected: initialBackendState,
  isDarkMode,
  onSwitchMode,
  isTransitioning,
  animationDirection,
  isSignToText,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string>("");
  const [currentPrediction, setCurrentPrediction] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<{
    message: string;
    details?: string;
  } | null>(null);
  const [isBackendConnected, setIsBackendConnected] =
    useState<boolean>(initialBackendState);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setError({
        message: "Failed to access the camera",
        details: "Unable to access the camera",
      });
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  }, []);

  const toggleTranslation = useCallback(() => {
    if (isTranslating) {
      setIsTranslating(false);
      stopCamera();
    } else {
      setIsTranslating(true);
      startCamera();
    }
  }, [isTranslating, startCamera, stopCamera]);

  const clearResult = useCallback(() => {
    setResult("");
    setCurrentPrediction("");
    setConfidence(0);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const predictSign = async () => {
      if (videoRef.current && canvasRef.current && isTranslating) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL("image/jpeg");

          try {
            const response = await fetch("/api/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: imageData }),
            });

            if (response.ok) {
              const data = await response.json();
              setCurrentPrediction(data.prediction);
              setConfidence(data.confidence);
              setResult((prev) => prev + data.prediction);
            } else {
              console.error("Error from prediction API:", response.statusText);
            }
          } catch (err) {
            console.error("Error during prediction:", err);
          }
        }

        animationFrameId = requestAnimationFrame(predictSign);
      }
    };

    if (isTranslating) {
      predictSign();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTranslating]);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("/api/health-check");
        setIsBackendConnected(response.ok);
        if (response.ok) {
          setError(null);
        }
      } catch (err) {
        console.error("Error checking backend connection:", err);
        setIsBackendConnected(false);
        setError({
          message: "Backend connection failed",
          details: "Unable to connect to the backend server",
        });
      }
    };

    checkBackendConnection();
    const intervalId = setInterval(checkBackendConnection, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const leftContent = (
    <div className="h-full flex flex-col">
      <div className="relative flex-grow mb-4">
        {isCameraActive ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="hidden" />
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
              width={640}
              height={480}
            />
          </>
        ) : (
          <CameraOffSign />
        )}
      </div>
      <div className="flex justify-center">
        <Button
          onClick={toggleTranslation}
          variant={isTranslating ? "destructive" : "default"}
          disabled={!isBackendConnected}
          size="sm"
          className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
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
        } p-4 rounded-lg flex-grow mb-2 shadow-inner overflow-auto border-2 ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        {isTranslating ? (
          <div className="flex items-center justify-center h-full">
            <Spinner className="w-8 h-8 text-blue-500" />
          </div>
        ) : (
          <p
            className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {result || "Start translating to see the result"}
          </p>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            onClick={clearResult}
            variant="outline"
            size="sm"
            className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            Clear
          </Button>
          <TextToSpeech text={result} isDarkMode={isDarkMode} />
        </div>
        <div
          className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Current: {currentPrediction} ({(confidence * 100).toFixed(2)}%)
        </div>
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
        Sign to Text
      </h1>
      {error && (
        <Alert
          message={error.message}
          details={error.details}
          onClose={() => setError(null)}
          isDarkMode={isDarkMode}
        />
      )}
      <TranslationLayout
        isDarkMode={isDarkMode}
        onSwitchMode={onSwitchMode}
        leftContent={leftContent}
        rightContent={rightContent}
        isTransitioning={isTransitioning}
        animationDirection={animationDirection}
        isSignToText={isSignToText}
      />
    </>
  );
};

export default SignToText;

