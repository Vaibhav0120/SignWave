import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignToText from "./pages/SignToText";
import TextToSign from "./pages/TextToSign";
import CursorGradient from "./components/CursorGradient";

const App: React.FC = () => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <div className={`App min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} flex flex-col`}>
        <Navbar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home isDarkMode={isDarkMode} />} />
            <Route
              path="/sign-to-text"
              element={<SignToText isBackendConnected={isBackendConnected} isDarkMode={isDarkMode} />}
            />
            <Route
              path="/text-to-sign"
              element={<TextToSign isBackendConnected={isBackendConnected} isDarkMode={isDarkMode} />}
            />
          </Routes>
        </main>
        <CursorGradient isDarkMode={isDarkMode} />
      </div>
    </Router>
  );
};

export default App;
