import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AlertProps {
  message: string;
  details?: string;
  onClose: () => void;
  isDarkMode: boolean;
}

const Alert: React.FC<AlertProps> = ({ message, details, onClose, isDarkMode }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md ${
          isDarkMode ? 'bg-red-900' : 'bg-red-500'
        } text-white p-4 rounded-lg shadow-lg`}
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

