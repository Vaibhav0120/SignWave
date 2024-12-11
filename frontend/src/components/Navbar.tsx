import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-10 backdrop-blur-md bg-gradient-to-r from-blue-600/30 to-purple-600/30 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">SignWave</Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/sign-to-text" className="text-white hover:text-blue-200 transition-colors">Sign to Text</Link>
          </li>
          <li>
            <Link to="/text-to-sign" className="text-white hover:text-blue-200 transition-colors">Text to Sign</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;