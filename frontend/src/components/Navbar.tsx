import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">SignWave</Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/sign-to-text" className="text-white hover:text-blue-200">Sign to Text</Link>
          </li>
          <li>
            <Link to="/text-to-sign" className="text-white hover:text-blue-200">Text to Sign</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

