import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import TextToSpeech from "../components/TextToSpeech";

const SignToText: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health-check");
        if (response.ok) {
          setIsBackendConnected(true);
          setError(null);
        } else {
          throw new Error("Backend health check failed");
        }
      } catch (error) {
        setIsBackendConnected(false);
        setError("Unable to connect to the backend. Please ensure the server is running.");
      }
    };

    checkBackendConnection();
    const intervalId = setInterval(checkBackendConnection, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const startCamera = async () => {
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
    };

    startCamera();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTranslating && isBackendConnected) {
      interval = setInterval(captureFrame, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTranslating, isBackendConnected]);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        sendImageToBackend(imageData);
      }
    }
  };

  const sendImageToBackend = async (imageData: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult((prevResult) => prevResult + data.prediction);
      setError(null);
    } catch (error) {
      console.error("Error sending image to backend:", error);
      setError("Failed to get prediction from the backend.");
      setIsBackendConnected(false);
    }
  };

  const toggleTranslation = () => {
    if (!isBackendConnected) {
      setError("Cannot start translation. Backend is not connected.");
      return;
    }
    setIsTranslating(!isTranslating);
  };

  const clearResult = () => {
    setResult("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-white">Sign to Text</h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto mb-4 rounded-lg"
            style={{ maxHeight: "70vh", transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className="hidden" width="640" height="480" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button 
              onClick={toggleTranslation} 
              variant="default"
              disabled={!isBackendConnected}
            >
              {isTranslating ? "Stop Translating" : "Start Translating"}
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Translated Text:</h2>
          <div className="bg-gray-800 p-4 rounded-lg min-h-[200px] mb-4">
            <p className="text-xl text-white">{result}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={clearResult} variant="outline">
              Clear
            </Button>
            <TextToSpeech text={result} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignToText;

