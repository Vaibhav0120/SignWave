import React from 'react';
import { Link } from 'react-router-dom';
import Switch from './Switch';

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, isDarkMode }) => {
  return (
    <nav className={`sticky top-0 z-10 backdrop-blur-md ${isDarkMode ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30' : 'bg-gradient-to-r from-blue-200/30 to-purple-200/30'} p-4`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-2xl font-bold`}>SignWave</Link>
          <Link to="/sign-to-text" className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-800 hover:text-blue-600'} transition-colors`}>Sign to Text</Link>
          <Link to="/text-to-sign" className={`${isDarkMode ? 'text-white hover:text-blue-200' : 'text-gray-800 hover:text-blue-600'} transition-colors`}>Text to Sign</Link>
        </div>
        <Switch toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </div>
    </nav>
  );
};

export default Navbar;

