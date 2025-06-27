import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star } from 'lucide-react';

const SearchResults: React.FC = () => {
  const mockResults = [
    {
      id: 1,
      name: "UniSwap",
      category: "DeFi",
      description: "Decentralized trading protocol",
      rating: 4.8,
      users: "2.1M"
    },
    {
      id: 2,
      name: "OpenSea",
      category: "NFT Marketplace",
      description: "Buy, sell, and discover NFTs",
      rating: 4.6,
      users: "1.5M"
    },
    {
      id: 3,
      name: "Compound",
      category: "DeFi",
      description: "Earn interest on crypto assets",
      rating: 4.7,
      users: "890K"
    }
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
                <p className="text-gray-400">Found {mockResults.length} dApps matching your search</p>
              </div>
              <button className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>

            <div className="space-y-4">
              {mockResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 hover:border-gray-600 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-white mr-3">{result.name}</h3>
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full">
                          {result.category}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4">{result.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {result.rating}
                        </div>
                        <div>{result.users} users</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors ml-4">
                      View dApp
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;