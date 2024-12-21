import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import TextToSpeech from "../components/TextToSpeech";
import CameraOffSign from "../components/CameraOffSign";
import ReverseButton from "../components/ReverseButton";

interface SignToTextProps {
  isBackendConnected: boolean;
  isDarkMode: boolean;
  onSwitchMode: () => void;
}

const SignToText: React.FC<SignToTextProps> = ({
  isBackendConnected: initialBackendState,
  isDarkMode,
  onSwitchMode,
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

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health-check");
        setIsBackendConnected(response.ok);
        if (!response.ok) {
          throw new Error(
            `Backend health check failed with status: ${response.status}`
          );
        }
      } catch (error) {
        setIsBackendConnected(false);
        setError({
          message: "Cannot connect to backend.",
          details: `Error: ${
            error instanceof Error ? error.message : String(error)
          }. Please ensure the backend server is running.`,
        });
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
          setError({
            message: "Unable to access the camera.",
            details: `Error: ${
              err instanceof Error ? err.message : String(err)
            }. Please ensure you have given permission.`,
          });
        }
      } else {
        const stream = videoRef.current?.srcObject as MediaStream | undefined;
        stream?.getTracks().forEach((track) => track.stop());
      }
    };

    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [isCameraActive]);

  const mirrorAndDrawHandTracking = useCallback(
    (bbox?: number[], prediction?: string) => {
      console.log("mirrorAndDrawHandTracking called with:", {
        bbox,
        prediction,
      });
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Mirror and draw the video
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          // Draw hand tracking if bbox and prediction are provided
          if (bbox && prediction) {
            const [x, y, w, h] = bbox;
            const mirroredX = canvas.width - (x + w);

            // Draw bounding box
            ctx.strokeStyle = "green";
            ctx.lineWidth = 2;
            ctx.strokeRect(mirroredX, y, w, h);

            // Draw prediction text
            ctx.fillStyle = "green";
            ctx.font = "24px Arial";
            ctx.textAlign = "left";
            ctx.fillText(prediction, mirroredX, y - 10);
          }
        }
      }
    },
    []
  );

  const sendImageToBackend = useCallback(async () => {
    console.log("sendImageToBackend called");
    if (!isBackendConnected) {
      setError({
        message: "Cannot send image. Backend is not connected.",
        details: "Please check your backend server and network connection.",
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageData = canvas.toDataURL("image/jpeg");
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
          mirrorAndDrawHandTracking(); // Clear previous tracking
          setError({
            message: "No hand detected in the image.",
            details:
              "Please ensure your hand is clearly visible in the camera frame.",
          });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);
      if (data.error) {
        setError({
          message: "Backend prediction error",
          details: data.error,
        });
      } else {
        setCurrentPrediction(data.prediction);
        setConfidence(data.confidence);
        mirrorAndDrawHandTracking(data.bbox, data.prediction);
        setError(null);
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
      setError({
        message: "Failed to get prediction from the backend.",
        details: `Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }, [isBackendConnected, mirrorAndDrawHandTracking]);

  useEffect(() => {
    let animationFrameId: number;
    let intervalId: NodeJS.Timeout;

    const updateFrame = () => {
      mirrorAndDrawHandTracking();
      animationFrameId = requestAnimationFrame(updateFrame);
    };

    if (isCameraActive) {
      updateFrame();
    }

    if (isTranslating && isBackendConnected && isCameraActive) {
      intervalId = setInterval(sendImageToBackend, 500); // Send image every 500ms
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isTranslating,
    isBackendConnected,
    isCameraActive,
    mirrorAndDrawHandTracking,
    sendImageToBackend,
  ]);

  useEffect(() => {
    if (currentPrediction && currentPrediction !== result[result.length - 1]) {
      setResult((prev) => prev + currentPrediction);
    }
  }, [currentPrediction, result]);

  const toggleTranslation = () => {
    if (!isBackendConnected) {
      setError({
        message: "Cannot start translation. Backend is not connected.",
        details: "Please ensure the backend server is running and accessible.",
      });
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
      <h1
        className={`text-4xl font-bold mb-8 ${
          isDarkMode ? "text-white" : "text-gray-900"
        } text-center`}
      >
        Sign to Text
      </h1>
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
          <p className="font-bold">{error.message}</p>
          {error.details && <p className="mt-2 text-sm">{error.details}</p>}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8 relative">
        <div className="w-full md:w-1/2">
          <div className="relative h-[50vh] md:h-[70vh] mb-4">
            {isCameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="hidden" />
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover rounded-lg"
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
        </div>

        <ReverseButton
          onClick={onSwitchMode}
          isClockwise={true}
          isDarkMode={isDarkMode}
        />

        <div className="w-full md:w-1/2 flex flex-col">
          <h2
            className={`text-2xl font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Translated Text:
          </h2>
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            } p-4 rounded-lg flex-grow mb-4 shadow-inner overflow-auto min-h-[120px]`}
          >
            <p
              className={`text-xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {result}
            </p>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                onClick={clearResult}
                variant="outline"
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                Clear
              </Button>
              <TextToSpeech text={result} />
            </div>
            <div className={isDarkMode ? "text-white" : "text-gray-900"}>
              Current: {currentPrediction} ({(confidence * 100).toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignToText;
