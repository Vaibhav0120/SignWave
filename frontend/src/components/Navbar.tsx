import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Sign Language Translator</Link>
        <ul className="flex space-x-4">
          <li><Link to="/sign-to-text" className="text-white hover:text-gray-300">Sign to Text</Link></li>
          <li><Link to="/text-to-sign" className="text-white hover:text-gray-300">Text to Sign</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;