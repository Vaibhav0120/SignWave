import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignToText from "./pages/SignToText";
import TextToSign from "./pages/TextToSign";
import CursorGradient from "./components/CursorGradient";

const App: React.FC = () => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

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

  return (
    <Router>
      <div className="App min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/sign-to-text"
              element={<SignToText isBackendConnected={isBackendConnected} />}
            />
            <Route
              path="/text-to-sign"
              element={<TextToSign isBackendConnected={isBackendConnected} />}
            />
          </Routes>
        </main>
        <CursorGradient />
      </div>
    </Router>
  );
};

export default App;
