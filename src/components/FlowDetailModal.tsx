import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Share,
  ExternalLink,
  Clock,
  BarChart3,
  Users,
  Star
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-600/20 text-green-300 border-green-600/30';
      case 'Intermediate':
        return 'bg-yellow-600/20 text-yellow-300 border-yellow-600/30';
      case 'Advanced':
        return 'bg-red-600/20 text-red-300 border-red-600/30';
      default:
        return 'bg-gray-600/20 text-gray-300 border-gray-600/30';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="flex h-[95vh]">
        {/* Left Column - Main Content */}
        <div className="flex-1 flex flex-col lg:w-[60%]">
          {/* Flow Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{flow.title}</h1>
                {flow.dappName && (
                  <p className="text-purple-400">from {flow.dappName}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : 'Play'} Flow
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors">
                  <Share className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentScreenIndex + 1) / flow.screens.length) * 100}%` }}
              />
            </div>

            {/* Screen Counter */}
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Screen {currentScreenIndex + 1} of {flow.screens.length}</span>
              <span>{flow.duration} total</span>
            </div>
          </div>

          {/* Main Screen Display */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-800/30">
            <div className="relative max-w-4xl w-full">
              <motion.div
                key={currentScreenIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[16/10] rounded-xl overflow-hidden border border-gray-600 shadow-2xl"
              >
                <img
                  src={currentScreen.thumbnail}
                  alt={currentScreen.title}
                  className="w-full h-full object-cover"
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{currentScreen.title}</h3>
                  {currentScreen.description && (
                    <p className="text-gray-300 text-sm">{currentScreen.description}</p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Screen Navigation Thumbnails */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {flow.screens.map((screen, index) => (
                <button
                  key={screen.id}
                  onClick={() => goToScreen(index)}
                  className={`flex-shrink-0 relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
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
                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <span className="text-xs text-white font-medium bg-black/60 px-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Metadata Sidebar */}
        <div className="w-full lg:w-[40%] border-l border-gray-700 bg-gray-800/50 overflow-y-auto">
          <div className="p-6">
            {/* Flow Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Flow Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center text-purple-400 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <p className="text-white font-bold">{flow.duration}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center text-purple-400 mb-2">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Screens</span>
                  </div>
                  <p className="text-white font-bold">{flow.screenCount}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-2 rounded-lg border text-sm font-medium ${getDifficultyColor(flow.difficulty)}`}>
                  {flow.difficulty} Level
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">About This Flow</h3>
              <p className="text-gray-300 leading-relaxed">{flow.description}</p>
            </div>

            {/* What You'll Learn */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3">What You'll Learn</h3>
              <ul className="space-y-2">
                {[
                  "How to navigate the interface",
                  "Understanding key features",
                  "Best practices and tips",
                  "Common pitfalls to avoid"
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-gray-300">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                <ExternalLink className="w-4 h-4 mr-2" />
                Try This Flow Live
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                <Star className="w-4 h-4 mr-2" />
                Save to Favorites
              </button>
            </div>

            {/* Related Flows */}
            <div className="mt-8">
              <h3 className="text-lg font-bold text-white mb-3">Related Flows</h3>
              <div className="space-y-3">
                {[
                  { title: "Advanced Trading", screens: 7, difficulty: "Advanced" },
                  { title: "Portfolio Management", screens: 4, difficulty: "Intermediate" }
                ].map((relatedFlow, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors cursor-pointer">
                    <h4 className="text-white font-medium mb-1">{relatedFlow.title}</h4>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{relatedFlow.screens} screens</span>
                      <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(relatedFlow.difficulty)}`}>
                        {relatedFlow.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FlowDetailModal;