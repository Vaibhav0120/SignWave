"use client"

import React from "react";
import { motion } from "framer-motion";
import ReverseButton from "./ReverseButton";

interface TranslationLayoutProps {
  isDarkMode: boolean;
  onSwitchMode: () => void;
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  isTransitioning: boolean;
  animationDirection: "clockwise" | "anticlockwise" | "none";
  isSignToText: boolean;
}

const TranslationLayout: React.FC<TranslationLayoutProps> = ({
  isDarkMode,
  onSwitchMode,
  leftContent,
  rightContent,
  isTransitioning,
  animationDirection,
  isSignToText,
}) => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const boxVariants = {
    initial: { y: 0 },
    bounceSignToText: (isLeft: boolean) => ({
      y: isLeft ? -20 : 20,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
    bounceTextToSign: (isLeft: boolean) => ({
      y: isLeft ? 20 : -20,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
  };

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-4 h-[calc(100vh-12rem)]"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={`flex-1 p-4 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        } overflow-auto`}
        variants={boxVariants}
        animate={isTransitioning ? (isSignToText ? "bounceSignToText" : "bounceTextToSign") : "initial"}
        custom={true} // isLeft = true
      >
        {leftContent}
      </motion.div>
      <div className="flex items-center justify-center">
        <ReverseButton
          onClick={onSwitchMode}
          isDarkMode={isDarkMode}
          isTransitioning={isTransitioning}
          animationDirection={animationDirection}
        />
      </div>
      <motion.div
        className={`flex-1 p-4 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        } overflow-auto`}
        variants={boxVariants}
        animate={isTransitioning ? (isSignToText ? "bounceSignToText" : "bounceTextToSign") : "initial"}
        custom={false} // isLeft = false
      >
        {rightContent}
      </motion.div>
    </motion.div>
  );
};

export default TranslationLayout;