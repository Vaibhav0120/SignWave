import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../components/ui/button";
import ToggleSwitch from "../components/ui/toggleSwitch";
import CameraOffSign from "../components/CameraOffSign";
import TranslationLayout from "../components/TranslationLayout";
import Alert from "../components/Alert";
import TextToSpeech from "../components/TextToSpeech";
import { performHandshake } from "../utils/api";

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
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [showCameraAlert, setShowCameraAlert] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isHandTrackingOn, setIsHandTrackingOn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Added error state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkBackendConnection = useCallback(async () => {
    try {
      console.log("Checking backend connection...");
      const isConnected = await performHandshake();
      console.log("Backend connection status:", isConnected);
      if (isConnected) {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      } else {
        setShowBackendAlert(true);
      }
    } catch (error) {
      console.error("Error checking backend connection:", error);
      setShowBackendAlert(true);
    }
  }, []);

  useEffect(() => {
    checkBackendConnection();
  }, [checkBackendConnection]);

  const startCamera = useCallback(async () => {
    try {
      console.log("Starting camera...");
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Camera started successfully");

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
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setIsTranslating(false);
  }, []);

  const drawVideoFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
          videoRef.current,
          -canvasRef.current.width,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        ctx.restore();
      }
    }
  }, []);

  const drawHandLandmarks = useCallback((landmarks: number[][]) => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        landmarks.forEach((point) => {
          ctx.beginPath();
          ctx.arc(
            canvasRef.current!.width - point[0],
            point[1],
            5,
            0,
            2 * Math.PI
          );
          ctx.stroke();
        });
      }
    }
  }, []);

  const predictSign = useCallback(async () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      try {
        console.log("Sending prediction request to backend...");
        const response = await fetch("http://localhost:5000/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: imageData,
            isHandTrackingOn: isHandTrackingOn,
          }),
        });
        console.log("Received response from backend");
        const data = await response.json();
        console.log("Prediction data:", data);
        if (data.error) {
          setError(data.error);
        } else if (data.prediction) {
          if (data.prediction !== 'No hand detected') {
            setTranslatedText((prevText) => {
              const newText = prevText + data.prediction;
              console.log("Updated translated text:", newText);
              return newText;
            });
          } else {
            console.log("No hand detected in this frame");
          }
          if (isHandTrackingOn && data.handLandmarks) {
            console.log("Drawing hand landmarks");
            drawHandLandmarks(data.handLandmarks);
          }
        }
      } catch (error: any) {
        console.error("Error predicting sign:", error);
        setError("Unable to connect to the translation service. Please try again.");
      }
    }
  }, [isHandTrackingOn, drawHandLandmarks]);

  useEffect(() => {
    let animationFrameId: number;
    if (isTranslating) {
      console.log("Starting translation loop");
      const animate = () => {
        drawVideoFrame();
        predictSign();
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    }
    return () => {
      if (animationFrameId) {
        console.log("Stopping translation loop");
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTranslating, drawVideoFrame, predictSign]);

  const toggleTranslation = async () => {
    if (isTranslating) {
      stopCamera();
    } else {
      console.log("Checking backend connection before starting...");
      try {
        const isConnected = await performHandshake();
        if (isConnected) {
          console.log("Backend connected. Starting camera...");
          startCamera();
        } else {
          console.error("Backend not connected. Cannot start translation.");
          setShowBackendAlert(true);
        }
      } catch (error: any) {
        console.error("Error checking backend connection:", error);
        setError(`Connection error: ${error.message || 'Unknown error occurred'}`);
      }
    }
  };

  const toggleHandTracking = () => {
    setIsHandTrackingOn(!isHandTrackingOn);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
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
      <div className="relative h-[calc(100%-3rem)] mb-4 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          width={1280}
          height={720}
        />
        {!isTranslating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CameraOffSign />
          </div>
        )}
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
        <div className="flex items-center">
          <span
            className={`mr-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Hand Tracking
          </span>
          <ToggleSwitch
            checked={isHandTrackingOn}
            onChange={toggleHandTracking}
            className="ml-2"
          />
        </div>
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
        <div
          className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}
        >
          Current: (0.00%)
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
      {showSuccessAlert && (
        <Alert
          message="Backend connected successfully"
          details="The translation service is ready to use."
          onClose={() => setShowSuccessAlert(false)}
          isDarkMode={isDarkMode}
          type="success"
        />
      )}
      {showBackendAlert && (
        <Alert
          message="Backend not connected"
          details="Unable to connect to the translation service."
          onClose={() => setShowBackendAlert(false)}
          isDarkMode={isDarkMode}
          type="error"
        />
      )}
      {showCameraAlert && (
        <Alert
          message="Camera access failed"
          details="Unable to access your camera. Please check your camera permissions and try again."
          onClose={() => setShowCameraAlert(false)}
          isDarkMode={isDarkMode}
          type="error"
        />
      )}
      {error && (
        <Alert
          message="Error"
          details={error}
          onClose={() => setError(null)}
          isDarkMode={isDarkMode}
          type="error"
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
    </div>
  );
};

export default SignToText;

