import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import TextToSpeech from "../components/TextToSpeech";
import CameraOffSign from "../components/CameraOffSign";

interface SignToTextProps {
  isBackendConnected: boolean;
  isDarkMode: boolean;
}

const SignToText: React.FC<SignToTextProps> = ({ isBackendConnected: initialBackendState, isDarkMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string>("");
  const [currentPrediction, setCurrentPrediction] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(initialBackendState);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

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
        setError("Cannot connect to backend. Please ensure the backend server is running.");
      }
    };

    checkBackendConnection();
    const intervalId = setInterval(checkBackendConnection, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (isCameraActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("Unable to access the camera. Please ensure you have given permission.");
        }
      } else {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
      }
    };

    startCamera();

    return () => {
      const currentVideo = videoRef.current;
      const stream = currentVideo?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isCameraActive]);

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
      setError("Cannot send image. Backend is not connected.");
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
        setError(data.error);
      } else {
        setCurrentPrediction(data.prediction);
        setConfidence(data.confidence);
        drawHandTracking(data.bbox, data.prediction);
        setError(null);
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      setError("Failed to get prediction from the backend.");
    }
  }, [isBackendConnected, drawHandTracking]);

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
    let interval: NodeJS.Timeout;
    if (isTranslating && isBackendConnected && isCameraActive) {
      interval = setInterval(captureFrame, 500); // Capture every 500ms
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTranslating, isBackendConnected, isCameraActive, captureFrame]);

  useEffect(() => {
    if (currentPrediction && currentPrediction !== result[result.length - 1]) {
      setResult(prev => prev + currentPrediction);
    }
  }, [currentPrediction, result]);

  const toggleTranslation = () => {
    if (!isBackendConnected) {
      setError("Cannot start translation. Backend is not connected.");
      return;
    }
    setIsTranslating(!isTranslating);
    setIsCameraActive(!isTranslating);
  };

  const clearResult = () => {
    setResult("");
    setCurrentPrediction("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'} text-center`}>Sign to Text</h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[70vh]">
          {isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="hidden"
              />
              <canvas 
                ref={canvasRef}
                className="w-full h-full object-cover mb-4 rounded-lg"
                width={640}
                height={480}
              />
            </>
          ) : (
            <CameraOffSign />
          )}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Button 
              onClick={toggleTranslation} 
              variant={isTranslating ? "destructive" : "default"}
              disabled={!isBackendConnected}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {isTranslating ? "Stop Translating" : "Start Translating"}
            </Button>
          </div>
        </div>
        <div className="h-[70vh] flex flex-col">
          <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Translated Text:</h2>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} p-4 rounded-lg flex-grow mb-4 shadow-inner overflow-auto`}>
            <p className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{result}</p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button onClick={clearResult} variant="outline" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                Clear
              </Button>
              <TextToSpeech text={result} />
            </div>
            <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              Current: {currentPrediction} ({(confidence * 100).toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignToText;

