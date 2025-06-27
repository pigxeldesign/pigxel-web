import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Share,
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
  const [isPlaying, setIsPlaying] = useState(false);

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
      {/* Single Column Layout - Full Width with Fixed Height */}
      <div className="flex flex-col h-[95vh] max-h-[95vh]">
        {/* Flow Header - Fixed Height */}
        <div className="flex-shrink-0 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">{flow.title}</h1>
              {flow.dappName && (
                <p className="text-purple-400 text-sm">from {flow.dappName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors">
                <Share className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentScreenIndex + 1) / flow.screens.length) * 100}%` }}
            />
          </div>

          {/* Screen Counter */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Screen {currentScreenIndex + 1} of {flow.screens.length}</span>
            <span>{flow.duration} total</span>
          </div>
        </div>

        {/* Main Screen Display - Flexible Height */}
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-800/30 min-h-0">
          <div className="relative w-full h-full max-w-5xl">
            <motion.div
              key={currentScreenIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full rounded-xl overflow-hidden border border-gray-600 shadow-2xl"
            >
              <img
                src={currentScreen.thumbnail}
                alt={currentScreen.title}
                className="w-full h-full object-contain bg-gray-900"
              />
              
              {/* Navigation Arrows */}
              {currentScreenIndex > 0 && (
                <button
                  onClick={prevScreen}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              {currentScreenIndex < flow.screens.length - 1 && (
                <button
                  onClick={nextScreen}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Screen Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-xl font-bold text-white mb-1">{currentScreen.title}</h3>
                {currentScreen.description && (
                  <p className="text-gray-300 text-sm">{currentScreen.description}</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Screen Navigation Thumbnails - Fixed Height */}
        <div className="flex-shrink-0 p-4 border-t border-gray-700">
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {flow.screens.map((screen, index) => (
              <button
                key={screen.id}
                onClick={() => goToScreen(index)}
                className={`flex-shrink-0 relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentScreenIndex 
                    ? 'border-purple-500 ring-2 ring-purple-500/30' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <img
                  src={screen.thumbnail}
                  alt={screen.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0.5 left-0.5 right-0.5 text-center">
                  <span className="text-xs text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FlowDetailModal;