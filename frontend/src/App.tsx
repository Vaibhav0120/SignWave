import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignToText from "./pages/SignToText";
import TextToSign from "./pages/TextToSign";
import CursorGradient from "./components/CursorGradient";

const AppContent: React.FC = () => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>("/");
  const [previousPage, setPreviousPage] = useState<string>("/");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health-check");
        setIsBackendConnected(response.ok);
      } catch (error) {
        setIsBackendConnected(false);
      }
    };

    checkBackendConnection();
    const intervalId = setInterval(checkBackendConnection, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setPreviousPage(currentPage);
    setCurrentPage(location.pathname);
  }, [location.pathname]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSwitchMode = () => {
    setIsTransitioning(true);
    if (location.pathname === "/sign-to-text") {
      navigate("/text-to-sign");
    } else if (location.pathname === "/text-to-sign") {
      navigate("/sign-to-text");
    }
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const getAnimationDirection = () => {
    if (previousPage === "/" || currentPage === "/") {
      return "none";
    } else if (
      (previousPage === "/sign-to-text" && currentPage === "/text-to-sign") ||
      (previousPage === "/text-to-sign" && currentPage === "/sign-to-text")
    ) {
      return previousPage === "/sign-to-text" ? "clockwise" : "anticlockwise";
    }
    return "none";
  };

  return (
    <div className={`App min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col`}>
      <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
          <Route
            path="/sign-to-text"
            element={
              <SignToText 
                isBackendConnected={isBackendConnected} 
                isDarkMode={isDarkMode} 
                onSwitchMode={handleSwitchMode}
                isTransitioning={isTransitioning}
                animationDirection={getAnimationDirection()}
              />
            }
          />
          <Route
            path="/text-to-sign"
            element={
              <TextToSign 
                isDarkMode={isDarkMode} 
                onSwitchMode={handleSwitchMode}
                isTransitioning={isTransitioning}
                animationDirection={getAnimationDirection()}
              />
            }
          />
        </Routes>
      </main>
      <CursorGradient isDarkMode={isDarkMode} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;