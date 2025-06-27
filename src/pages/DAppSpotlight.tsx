import React from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Globe, Github, Twitter } from 'lucide-react';

const DAppSpotlight: React.FC = () => {
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
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 mb-8 border border-purple-500/20">
              <div className="flex flex-col lg:flex-row items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">U</span>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">UniSwap</h1>
                  <p className="text-gray-300 text-lg mb-4">
                    The world's leading decentralized trading protocol, built on Ethereum
                  </p>
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      4.8 Rating
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      2.1M Users
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      DeFi
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    Launch dApp
                  </button>
                  <button className="px-6 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">About UniSwap</h2>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Uniswap is a decentralized exchange protocol built on Ethereum. It allows users to 
                    swap ERC-20 tokens without the need for traditional order books or centralized intermediaries.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    The protocol uses an automated market maker (AMM) system, where liquidity providers 
                    deposit tokens into smart contracts, creating liquidity pools that enable seamless trading.
                  </p>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Key Features</h3>
                  <ul className="space-y-3">
                    {[
                      "Decentralized token swapping",
                      "Liquidity provision rewards",
                      "No registration required",
                      "Open source protocol",
                      "Community governance"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Volume</span>
                      <span className="text-white font-medium">$1.2T</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Liquidity</span>
                      <span className="text-white font-medium">$4.2B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">24h Volume</span>
                      <span className="text-white font-medium">$890M</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Links</h3>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center text-gray-300 hover:text-white transition-colors">
                      <Globe className="w-4 h-4 mr-3" />
                      Official Website
                    </a>
                    <a href="#" className="flex items-center text-gray-300 hover:text-white transition-colors">
                      <Github className="w-4 h-4 mr-3" />
                      GitHub Repository
                    </a>
                    <a href="#" className="flex items-center text-gray-300 hover:text-white transition-colors">
                      <Twitter className="w-4 h-4 mr-3" />
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DAppSpotlight;