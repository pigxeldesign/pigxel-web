import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Info } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gray-800/50 border border-gray-700 hover:border-purple-500/50 rounded-xl p-4 cursor-pointer transition-colors hover:bg-gray-800/70"
      onClick={onClick}
    >
      <div className="flex items-start">
        <Search className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
        <p className="text-gray-300 text-sm">{question}</p>
      </div>
    </motion.div>
  );
};

const Web3NavigatorPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const popularQuestions = [
    "Show me safe options for earning yield as a beginner.",
    "I want to earn yield, but I'm risk-averse. What should I do?",
    "I have $500 in ETH and want to earn some yield, but I'm worried about risk. What are 2-3 relatively safe options for a beginner?",
    "I keep hearing about 'liquid staking'. Can you explain what it is and show me the user flow for a trusted app?"
  ];
  
  const handleQuestionClick = (question: string) => {
    setQuery(question);
    // In a real implementation, this would trigger the search/AI response
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would trigger the search/AI response
    console.log("Submitting query:", query);
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 relative">
              <img 
                src="/ChatGPT_Image_29_Jun_2025__15.05.43-removebg-preview.png" 
                alt="Web3 Navigator AI" 
                className="w-full h-full object-contain"
              />
              <motion.div 
                className="absolute inset-0 rounded-full"
                animate={{ 
                  boxShadow: ['0 0 0 0 rgba(139, 92, 246, 0)', '0 0 0 10px rgba(139, 92, 246, 0.3)', '0 0 0 0 rgba(139, 92, 246, 0)'] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Your Guide to Practical Web3 Solutions
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Ask anything. Explore a world of practical dApps.
          </p>
          
          {/* Search Interface */}
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-4">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsTyping(true);
                  setTimeout(() => setIsTyping(false), 1000);
                }}
                placeholder="Ask anything about Web3 utility..."
                className="w-full px-5 py-4 pr-12 bg-gray-800/70 border border-gray-700 focus:border-purple-500 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-lg"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Send className={`w-5 h-5 ${isTyping ? 'text-purple-500' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <img 
                src="/ChatGPT_Image_29_Jun_2025__15.05.43-removebg-preview.png" 
                alt="" 
                className="w-4 h-4 mr-1 opacity-70"
              />
              Powered by Web3 Navigator AI
            </div>
          </form>
        </motion.div>
        
        {/* Popular Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">
            POPULAR QUESTIONS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularQuestions.map((question, index) => (
              <QuestionCard 
                key={index} 
                question={question} 
                onClick={() => handleQuestionClick(question)}
              />
            ))}
          </div>
          
          {/* Info Section */}
          <div className="mt-12 bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Info className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-300 font-medium">How it works</span>
            </div>
            <p className="text-gray-400 text-sm">
              Web3 Navigator uses AI to help you discover the most practical decentralized applications
              for your specific needs. Ask any question about Web3 utility and get personalized recommendations.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Web3NavigatorPage;