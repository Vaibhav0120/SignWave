import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignToText from './pages/SignToText';
import TextToSign from './pages/TextToSign';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-to-text" element={<SignToText />} />
            <Route path="/text-to-sign" element={<TextToSign />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;

