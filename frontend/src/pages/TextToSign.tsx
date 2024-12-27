import React, { useState, useRef, useCallback, useEffect } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPrediction, setCurrentPrediction] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const addAlert = useCallback((alert: AlertInfo) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]);
    setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(a => a !== alert));
    }, 5000);
  }, []);

  const startTranslation = useCallback(async () => {
    if (!isBackendConnected) {
      addAlert({
        message: "Backend Error",
        details: "Cannot start translation. Backend is not connected.",
        type: "error"
      });
      return;
    }
    setIsTranslating(true);
    setIsCameraActive(true);
    addAlert({
      message: "Translation started",
      details: "Camera is now on.",
      type: "info"
    });
  }, [addAlert, isBackendConnected]);

  const stopTranslation = useCallback(() => {
    setIsTranslating(false);
    setIsCameraActive(false);
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

  const drawHandTracking = useCallback((bbox: number[], prediction: string) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Draw bounding box
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);

        // Draw prediction text
        ctx.fillStyle = 'green';
        ctx.font = '24px Arial';
        ctx.fillText(prediction, bbox[0], bbox[1] - 10);
      }
    }
  }, []);

  const sendImageToBackend = useCallback(async (imageData: string) => {
    if (!isBackendConnected) {
      addAlert({
        message: "Backend Error",
        details: "Cannot send image. Backend is not connected.",
        type: "error"
      });
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });
      if (!response.ok) {
        if (response.status === 400) {
          console.log("No hand detected");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.error) {
        addAlert({
          message: "Prediction Error",
          details: data.error,
          type: "error"
        });
      } else {
        setCurrentPrediction(data.prediction);
        setConfidence(data.confidence);
        drawHandTracking(data.bbox, data.prediction);
        setTranslatedText(prev => prev + data.prediction);
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      addAlert({
        message: "Backend Error",
        details: "Failed to get prediction from the backend.",
        type: "error"
      });
    }
  }, [isBackendConnected, addAlert, drawHandTracking]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg");
        sendImageToBackend(imageData);
      }
    }
  }, [sendImageToBackend]);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health-check");
        setIsBackendConnected(response.ok);
        if (!response.ok) {
          throw new Error("Backend is not responding");
        }
      } catch (error) {
        setIsBackendConnected(false);
        addAlert({
          message: "Backend Connection Error",
          details: "Cannot connect to backend. Please ensure the backend server is running.",
          type: "error"
        });
      }
    };

    checkBackendConnection();
    const intervalId = setInterval(checkBackendConnection, 5000);

    return () => clearInterval(intervalId);
  }, [addAlert]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      if (isCameraActive) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          addAlert({
            message: "Camera Error",
            details: "Unable to access the camera. Please ensure you have given permission.",
            type: "error"
          });
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive, addAlert]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTranslating && isBackendConnected && isCameraActive) {
      interval = setInterval(captureFrame, 500); // Capture every 500ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTranslating, isBackendConnected, isCameraActive, captureFrame, addAlert]);

  const leftContent = (
    <div className="h-full flex flex-col">
      <div className="relative h-[calc(100%-3rem)] mb-4 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isCameraActive ? '' : 'hidden'}`}
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-full ${isCameraActive ? '' : 'hidden'}`}
          width={640}
          height={480}
        />
        {!isCameraActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CameraOffSign isOn={false} />
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
          disabled={!isBackendConnected}
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
        <div className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Current: {currentPrediction} ({(confidence * 100).toFixed(2)}%)
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

