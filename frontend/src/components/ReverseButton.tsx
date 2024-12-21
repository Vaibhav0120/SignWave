import React from 'react';
import { Button } from "./ui/button";

interface ReverseButtonProps {
  onClick: () => void;
  isClockwise?: boolean;
  isDarkMode: boolean;
}

const ReverseButton: React.FC<ReverseButtonProps> = ({ onClick, isClockwise = true, isDarkMode }) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
        hidden md:flex items-center justify-center w-12 h-12 rounded-full 
        ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
      title={isClockwise ? "Switch to Text to Sign" : "Switch to Sign to Text"}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transform ${isClockwise ? '' : 'scale-x-[-1]'} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
      >
        <path
          d="M2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M12 2C9.79086 2 7.82504 3.15893 6.82504 4.82504"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M2 7L6.82504 4.82504L9 9.64997"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Button>
  );
};

export default ReverseButton;