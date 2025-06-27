import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Share } from 'lucide-react';

const FlowViewer: React.FC = () => {
  const flowSteps = [
    { id: 1, title: "Connect Wallet", description: "Connect your Web3 wallet to get started", status: "completed" },
    { id: 2, title: "Select Tokens", description: "Choose the tokens you want to swap", status: "active" },
    { id: 3, title: "Set Amount", description: "Enter the amount you want to trade", status: "pending" },
    { id: 4, title: "Review Transaction", description: "Confirm the swap details and fees", status: "pending" },
    { id: 5, title: "Execute Swap", description: "Complete the token swap", status: "pending" }
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Token Swap Flow</h1>
                <p className="text-gray-400">Step-by-step guide to swapping tokens on UniSwap</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  <Play className="w-4 h-4 mr-2" />
                  Start Flow
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Flow Visualization */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 mb-8">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <button className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors">
                    <Play className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">
                    <Pause className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                <div className="absolute left-8 top-0 w-0.5 h-20 bg-purple-500"></div>

                {/* Steps */}
                <div className="space-y-8">
                  {flowSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative flex items-start"
                    >
                      {/* Step indicator */}
                      <div className={`relative z-10 w-4 h-4 rounded-full mr-6 mt-1 ${
                        step.status === 'completed' 
                          ? 'bg-green-500' 
                          : step.status === 'active' 
                          ? 'bg-purple-500' 
                          : 'bg-gray-600'
                      }`}>
                        {step.status === 'active' && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-purple-500"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Step content */}
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 ${
                          step.status === 'active' ? 'text-purple-300' : 'text-white'
                        }`}>
                          {step.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{step.description}</p>
                      </div>

                      {/* Step status */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        step.status === 'completed' 
                          ? 'bg-green-600/20 text-green-300' 
                          : step.status === 'active' 
                          ? 'bg-purple-600/20 text-purple-300' 
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {step.status === 'completed' ? 'Completed' : 
                         step.status === 'active' ? 'In Progress' : 'Pending'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Flow Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Flow Overview</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  This interactive flow demonstrates the complete process of swapping tokens on a 
                  decentralized exchange. Follow each step to understand how DeFi protocols work.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white">~2-3 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="text-white">Beginner</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Prerequisites:</span>
                    <span className="text-white">Web3 wallet</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">What You'll Learn</h2>
                <ul className="space-y-3">
                  {[
                    "How to connect a Web3 wallet",
                    "Understanding token swaps",
                    "Reading transaction fees",
                    "Confirming blockchain transactions",
                    "Verifying completed swaps"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FlowViewer;