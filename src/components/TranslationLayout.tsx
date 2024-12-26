"use client"

import React, { useState, useEffect } from "react";
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
  const [isVerticalLayout, setIsVerticalLayout] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsVerticalLayout(window.innerWidth < 1024 || window.innerHeight < 600);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  const boxVariants = {
    initial: { x: 0, y: 0 },
    bounceSignToTextDesktop: (isLeft: boolean) => ({
      y: isLeft ? -20 : 20,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
    bounceTextToSignDesktop: (isLeft: boolean) => ({
      y: isLeft ? 20 : -20,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
    bounceSignToTextMobile: (isLeft: boolean) => ({
      x: isLeft ? -20 : 20,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
    bounceTextToSignMobile: (isLeft: boolean) => ({
      x: isLeft ? 20 : -20,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    }),
  };

  const getAnimationVariant = (isSignToText: boolean, isVerticalLayout: boolean, isLeft: boolean) => {
    if (isVerticalLayout) {
      return isSignToText ? "bounceSignToTextMobile" : "bounceTextToSignMobile";
    } else {
      return isSignToText ? "bounceSignToTextDesktop" : "bounceTextToSignDesktop";
    }
  };

  return (
    <motion.div
      className={`flex ${isVerticalLayout ? 'flex-col' : 'flex-row'} gap-4 h-[calc(100vh-12rem)] min-h-[500px] max-h-[calc(100vh-12rem)]`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <motion.div
        className={`flex-1 p-4 rounded-lg ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        } overflow-hidden ${isVerticalLayout ? 'h-[calc(50%-2rem)]' : 'h-full'}`}
        variants={boxVariants}
        animate={isTransitioning ? getAnimationVariant(isSignToText, isVerticalLayout, true) : "initial"}
        custom={true} // isLeft = true
      >
        <div className="h-full overflow-auto">
          {leftContent}
        </div>
      </motion.div>
      <div className={`flex ${isVerticalLayout ? 'justify-center py-2' : 'items-center justify-center'}`}>
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
        } overflow-hidden ${isVerticalLayout ? 'h-[calc(50%-2rem)]' : 'h-full'}`}
        variants={boxVariants}
        animate={isTransitioning ? getAnimationVariant(isSignToText, isVerticalLayout, false) : "initial"}
        custom={false} // isLeft = false
      >
        <div className="h-full overflow-auto">
          {rightContent}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TranslationLayout;

