"use client"

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import CameraOffSign from "../components/CameraOffSign";
import TranslationLayout from "../components/TranslationLayout";
import Alert from '../components/Alert';
import TextToSpeech from '../components/TextToSpeech';

interface SignToTextProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
  isSignToText: boolean;
}

const SignToText: React.FC<SignToTextProps> = ({
  isDarkMode,
  onSwitchMode,
  isTransitioning,
  animationDirection,
  isSignToText,
}) => {
  const [showBackendAlert, setShowBackendAlert] = useState<boolean>(false);
  const [showCameraAlert, setShowCameraAlert] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setIsTranslating(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setShowCameraAlert(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setIsTranslating(false);
  }, []);

  const drawVideoFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.restore();
      }
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    if (isTranslating) {
      const animate = () => {
        drawVideoFrame();
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTranslating, drawVideoFrame]);

  const toggleTranslation = () => {
    if (isTranslating) {
      stopCamera();
    } else {
      startCamera();
      // Simulate backend connection failure
      setShowBackendAlert(true);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (showBackendAlert) {
      const timer = setTimeout(() => {
        setShowBackendAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showBackendAlert]);

  const leftContent = (
    <div className="h-full flex flex-col">
      <div className="relative flex-grow mb-4 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="hidden"
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover"
          width={1280}
          height={720}
        />
        {!isTranslating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CameraOffSign />
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <Button
          variant="default"
          size="sm"
          className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
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
        } p-4 rounded-lg flex-grow mb-2 shadow-inner overflow-auto border-2 ${
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
              isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => setTranslatedText("")}
          >
            Clear
          </Button>
          <TextToSpeech text={translatedText} isDarkMode={isDarkMode} />
        </div>
        <div
          className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Current: (0.00%)
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
      {showBackendAlert && (
        <Alert
          message="Backend not connected"
          details="Unable to connect to the translation service."
          onClose={() => setShowBackendAlert(false)}
          isDarkMode={isDarkMode}
        />
      )}
      {showCameraAlert && (
        <Alert
          message="Camera access failed"
          details="Unable to access your camera. Please check your camera permissions and try again."
          onClose={() => setShowCameraAlert(false)}
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

