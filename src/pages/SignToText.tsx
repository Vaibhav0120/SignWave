import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "../components/ui/button";
import CameraOffSign from "../components/CameraOffSign";
import TranslationLayout from "../components/TranslationLayout";
import Alert from "../components/Alert";
import TextToSpeech from "../components/TextToSpeech";
import { predictSign } from "../utils/api";

interface SignToTextProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
  isSignToText: boolean;
  modelLoaded: boolean;
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
  modelLoaded,
}) => {
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [currentPrediction, setCurrentPrediction] = useState<string>("");
  const [detections, setDetections] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const predictionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addAlert = useCallback((alert: AlertInfo) => {
    setAlerts(prevAlerts => [...prevAlerts, alert]);
    setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(a => a !== alert));
    }, 5000);
  }, []);

  const captureAndPredictSign = useCallback(async () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        // Flip the image horizontally
        ctx.translate(canvasRef.current.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation

        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        try {
          const result = await predictSign(imageData);
          setDetections(result);
          if (result.prediction && result.prediction !== currentPrediction) {
            setCurrentPrediction(result.prediction);
            setTranslatedText((prevText) => prevText + " " + result.prediction);
          }
          drawDetections(ctx, result);
        } catch (error: any) {
          console.error("Translation error:", error.message);
        }
      }
    }
  }, [currentPrediction]);

  const drawDetections = useCallback((ctx: CanvasRenderingContext2D, detections: any) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (detections && detections.boxes && detections.scores && detections.classes) {
      detections.boxes.forEach((box: number[], i: number) => {
        if (detections.scores[i] > 0.5) {
          const [y, x, boxHeight, boxWidth] = box;
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
          ctx.strokeRect(x * width, y * height, boxWidth * width, boxHeight * height);

          ctx.font = "16px Arial";
          ctx.fillStyle = "green";
          ctx.fillText(
            `${detections.classes[i]}: ${Math.round(detections.scores[i] * 100)}%`,
            x * width,
            y * height - 5
          );
        }
      });
    }
  }, []);

  const startRealTimeTranslation = useCallback(() => {
    const runPrediction = () => {
      captureAndPredictSign();
      predictionIntervalRef.current = setTimeout(runPrediction, 200);
    };
    runPrediction();
  }, [captureAndPredictSign]);

  const startCamera = useCallback(async () => {
    if (!modelLoaded) {
      addAlert({
        message: "Model not loaded",
        details: "Please wait for the model to load before starting translation.",
        type: "warning"
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        await videoRef.current.play();
      }
      setIsTranslating(true);
      addAlert({
        message: "Camera started",
        details: "Real-time translation has begun.",
        type: "info"
      });
      startRealTimeTranslation();
    } catch (err) {
      addAlert({
        message: "Camera access failed",
        details: "Unable to access your camera. Please check your camera permissions and try again.",
        type: "error"
      });
    }
  }, [modelLoaded, addAlert, startRealTimeTranslation]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTranslating(false);
    if (predictionIntervalRef.current) {
      clearTimeout(predictionIntervalRef.current);
    }
    addAlert({
      message: "Camera stopped",
      details: "The camera has been deactivated.",
      type: "info"
    });
  }, [addAlert]);

  const toggleTranslation = useCallback(() => {
    if (isTranslating) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isTranslating, startCamera, stopCamera]);

  useEffect(() => {
    if (modelLoaded) {
      addAlert({
        message: "Model loaded",
        details: "Translation service is ready.",
        type: "success"
      });
    }
  }, [modelLoaded, addAlert]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (predictionIntervalRef.current) {
        clearTimeout(predictionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (detections) {
      console.log("Detections:", detections);
    }
  }, [detections]);

  const leftContent = (
    <div className="h-full flex flex-col">
      <div className="relative h-[calc(100%-3rem)] mb-4 bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover transform scale-x-[-1]"
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
          disabled={!modelLoaded}
        >
          {isTranslating ? "Stop Translating" : "Start Translating"}
        </Button>
        {isTranslating && (
          <p className={`text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Real-time translation active
          </p>
        )}
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

