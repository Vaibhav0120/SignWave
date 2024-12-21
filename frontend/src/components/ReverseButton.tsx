"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "./ui/button";
import { ArrowLeftRight } from 'lucide-react';

interface ReverseButtonProps {
  onClick: () => void;
  isDarkMode: boolean;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
}

const ReverseButton: React.FC<ReverseButtonProps> = ({ 
  onClick, 
  isDarkMode, 
  isTransitioning,
  animationDirection
}) => {
  const [totalRotation, setTotalRotation] = useState(0);

  useEffect(() => {
    if (isTransitioning) {
      if (animationDirection === "clockwise") {
        setTotalRotation(prev => prev + 360);
      } else if (animationDirection === "anticlockwise") {
        setTotalRotation(prev => prev - 360);
      }
    }
  }, [isTransitioning, animationDirection]);

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ rotate: totalRotation }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Button
        onClick={onClick}
        variant="ghost"
        className={`
          flex items-center justify-center w-12 h-12 rounded-full
          ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}
          transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl
        `}
        title="Switch translation mode"
      >
        <ArrowLeftRight size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
      </Button>
    </motion.div>
  );
};

export default ReverseButton;