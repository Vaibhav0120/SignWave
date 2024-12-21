"use client"

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import ReverseButton from './ReverseButton';

interface TranslationLayoutProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  isClockwise: boolean;
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const TranslationLayout: React.FC<TranslationLayoutProps> = ({
  isDarkMode,
  onSwitchMode,
  isClockwise,
  leftContent,
  rightContent
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center relative">
        <motion.div
          className="w-full md:w-[calc(50%-1rem)] min-w-[320px] min-h-[320px] max-w-[600px] max-h-[600px] aspect-square"
          initial={false}
          animate={{ x: [null, -20, 0], opacity: [null, 0.5, 1] }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.6,
          }}
          key={`left-${isClockwise}`}
        >
          {leftContent}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <ReverseButton
            onClick={onSwitchMode}
            isClockwise={isClockwise}
            isDarkMode={isDarkMode}
          />
        </div>

        <motion.div
          className="w-full md:w-[calc(50%-1rem)] min-w-[320px] min-h-[320px] max-w-[600px] max-h-[600px] aspect-square"
          initial={false}
          animate={{ x: [null, 20, 0], opacity: [null, 0.5, 1] }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            duration: 0.6,
          }}
          key={`right-${isClockwise}`}
        >
          {rightContent}
        </motion.div>
      </div>
    </div>
  );
};

export default TranslationLayout;

