import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';

const Home = lazy(() => import('./pages/Home'));
const SignToText = lazy(() => import('./pages/SignToText'));
const TextToSign = lazy(() => import('./pages/TextToSign'));

const Loading: React.FC = () => <div>Loading...</div>;

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sign-to-text" element={<SignToText />} />
            <Route path="/text-to-sign" element={<TextToSign />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;

