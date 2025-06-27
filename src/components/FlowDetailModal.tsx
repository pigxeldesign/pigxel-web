import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import Modal from './Modal';

interface FlowScreen {
  id: string;
  thumbnail: string;
  title: string;
  description?: string;
}

interface Flow {
  id: string;
  title: string;
  screens: FlowScreen[];
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  screenCount: number;
  dappName?: string;
}

interface FlowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  flow: Flow | null;
  initialScreenIndex?: number;
}

const FlowDetailModal: React.FC<FlowDetailModalProps> = ({
  isOpen,
  onClose,
  flow,
  initialScreenIndex = 0
}) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(initialScreenIndex);

  if (!flow) return null;

  const currentScreen = flow.screens[currentScreenIndex];

  const nextScreen = () => {
    setCurrentScreenIndex((prev) => 
      prev < flow.screens.length - 1 ? prev + 1 : prev
    );
  };

  const prevScreen = () => {
    setCurrentScreenIndex((prev) => prev > 0 ? prev - 1 : prev);
  };

  const goToScreen = (index: number) => {
    setCurrentScreenIndex(index);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="relative h-[95vh] bg-black flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-white hover:text-gray-300 hover:bg-black/50 rounded-lg transition-colors backdrop-blur-sm"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main Image Display */}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <motion.div
            key={currentScreenIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-6xl max-h-full w-full"
          >
            <img
              src={currentScreen.thumbnail}
              alt={currentScreen.title}
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
            
            {/* Navigation Arrows */}
            {currentScreenIndex > 0 && (
              <button
                onClick={prevScreen}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            
            {currentScreenIndex < flow.screens.length - 1 && (
              <button
                onClick={nextScreen}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Screen Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm backdrop-blur-sm">
              {currentScreenIndex + 1} / {flow.screens.length}
            </div>
          </motion.div>
        </div>

        {/* Bottom Thumbnail Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-8">
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {flow.screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => goToScreen(index)}
                className={`flex-shrink-0 relative w-16 h-10 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentScreenIndex 
                    ? 'border-white ring-2 ring-white/30' 
                    : 'border-gray-500 hover:border-gray-300'
                }`}
              >
                <img
                  src={screen.thumbnail}
                  alt={screen.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${
                  index === currentScreenIndex ? 'bg-white/20' : 'bg-black/40'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FlowDetailModal;