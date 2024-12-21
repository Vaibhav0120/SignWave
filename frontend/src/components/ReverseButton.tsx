"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "./ui/button";
import { ArrowLeftRight } from 'lucide-react';

interface ReverseButtonProps {
  onClick: () => void;
  isClockwise?: boolean;
  isDarkMode: boolean;
}

const ReverseButton: React.FC<ReverseButtonProps> = ({ onClick, isClockwise = true, isDarkMode }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={onClick}
        variant="ghost"
        className={`
          flex items-center justify-center w-14 h-14 rounded-full
          ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}
          transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl
        `}
        title={isClockwise ? "Switch to Text to Sign" : "Switch to Sign to Text"}
      >
        <motion.div
          animate={{ rotate: isClockwise ? 0 : 180 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <ArrowLeftRight size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default ReverseButton;

