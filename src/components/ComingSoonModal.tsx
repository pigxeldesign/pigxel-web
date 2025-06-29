import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative bg-gradient-to-br from-blue-900/90 to-purple-900/90 border border-blue-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="text-center pt-4 pb-2">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <img 
              src="/ChatGPT_Image_29_Jun_2025__15.05.43-removebg-preview.png" 
              alt="AI" 
              className="w-full h-full object-contain"
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-blue-400/50"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-blue-200 mb-6">Building the Future, Block by Block</p>
          
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-100">
              Our AI-powered comparison tool is currently in development. 
              We're working hard to bring you intelligent insights across Web3 platforms.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoonModal;