import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import TextToSpeech from "../components/TextToSpeech";
import { debounce } from 'lodash';

interface SignToTextProps {
  isBackendConnected: boolean;
}

const SignToText: React.FC<SignToTextProps> = ({ isBackendConnected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const sendImageToBackend = useCallback(debounce(async (imageData: string) => {
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
    }
  }, 1000), []);

  const captureFrame = useCallback(() => {
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
  }, [sendImageToBackend]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTranslating && isBackendConnected) {
      interval = setInterval(captureFrame, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTranslating, isBackendConnected, captureFrame]);

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
      <h1 className="text-4xl font-bold mb-8 text-white text-center">Sign to Text</h1>
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
              variant={isTranslating ? "destructive" : "default"}
              disabled={!isBackendConnected}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {isTranslating ? "Stop Translating" : "Start Translating"}
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Translated Text:</h2>
          <div className="bg-gray-800 p-4 rounded-lg min-h-[200px] mb-4 shadow-inner">
            <p className="text-xl text-white">{result}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={clearResult} variant="outline" className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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