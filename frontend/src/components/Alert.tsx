import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AlertProps {
  message: string;
  details?: string;
  onClose: () => void;
  isDarkMode: boolean;
  type: 'success' | 'warning' | 'error' | 'info';
}

const Alert: React.FC<AlertProps> = ({ message, details, onClose, isDarkMode, type }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBackgroundColor = () => {
    if (type === 'success') return isDarkMode ? 'bg-green-800' : 'bg-green-500';
    if (type === 'warning') return isDarkMode ? 'bg-yellow-800' : 'bg-yellow-500';
    if (type === 'error') return isDarkMode ? 'bg-red-800' : 'bg-red-500';
    if (type === 'info') return isDarkMode ? 'bg-blue-800' : 'bg-blue-500';
    return isDarkMode ? 'bg-gray-800' : 'bg-gray-500';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 w-full max-w-md ${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold">{message}</p>
            {details && <p className="mt-2 text-sm">{details}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;

