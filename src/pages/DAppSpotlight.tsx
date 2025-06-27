import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Users, 
  Globe, 
  Github, 
  Twitter, 
  ExternalLink, 
  ChevronRight,
  Play,
  BookOpen,
  MessageCircle,
  Loader2
} from 'lucide-react';

interface DApp {
  id: string;
  name: string;
  description: string;
  problemSolved: string;
  logo: string;
  thumbnail: string;
  category: string;
  subCategory: string;
  blockchains: string[];
  rating: number;
  userCount: string;
  liveUrl: string;
  githubUrl?: string;
  twitterUrl?: string;
  documentationUrl?: string;
  discordUrl?: string;
  flows: Flow[];
}

interface Flow {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const DAppSpotlight: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dapp, setDApp] = useState<DApp | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from Supabase
  const mockDApp: DApp = {
    id: id || '1',
    name: 'Uniswap',
    description: 'The world\'s leading decentralized trading protocol, built on Ethereum. Swap, earn, and build on the leading decentralized crypto trading protocol.',
    problemSolved: 'Enables permissionless token trading without intermediaries',
    logo: '🦄',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
    category: 'DeFi',
    subCategory: 'DEX',
    blockchains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'],
    rating: 4.8,
    userCount: '4.2M',
    liveUrl: 'https://app.uniswap.org',
    githubUrl: 'https://github.com/Uniswap',
    twitterUrl: 'https://twitter.com/Uniswap',
    documentationUrl: 'https://docs.uniswap.org',
    discordUrl: 'https://discord.gg/uniswap',
    flows: [
      {
        id: '1',
        title: 'How to Swap Tokens',
        thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        description: 'Learn how to swap tokens on Uniswap',
        duration: '3 min',
        difficulty: 'Beginner'
      },
      {
        id: '2',
        title: 'Providing Liquidity',
        thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        description: 'Earn fees by providing liquidity',
        duration: '5 min',
        difficulty: 'Intermediate'
      },
      {
        id: '3',
        title: 'Understanding Slippage',
        thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        description: 'Learn about slippage and how to manage it',
        duration: '4 min',
        difficulty: 'Beginner'
      },
      {
        id: '4',
        title: 'Advanced Trading Strategies',
        thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        description: 'Advanced techniques for experienced traders',
        duration: '8 min',
        difficulty: 'Advanced'
      },
      {
        id: '5',
        title: 'Yield Farming Basics',
        thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        description: 'Introduction to yield farming strategies',
        duration: '6 min',
        difficulty: 'Intermediate'
      },
      {
        id: '6',
        title: 'Gas Optimization Tips',
        thumbnail: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
        description: 'Save money on transaction fees',
        duration: '4 min',
        difficulty: 'Intermediate'
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setDApp(mockDApp);
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading dApp details...</p>
        </div>
      </div>
    );
  }

  if (!dapp) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">dApp Not Found</h1>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-600/20 text-green-300';
      case 'Intermediate':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'Advanced':
        return 'bg-red-600/20 text-red-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  return (
    <div className="pt-16 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-gray-400 mb-6"
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/category/${dapp.category.toLowerCase()}`} className="hover:text-white transition-colors">
              {dapp.category}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{dapp.name}</span>
          </motion.nav>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 mb-8 border border-purple-500/20"
          >
            <div className="flex flex-col lg:flex-row items-start gap-6">
              {/* Logo and Basic Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-3xl">
                  {dapp.logo}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{dapp.name}</h1>
                  <h2 className="text-xl lg:text-2xl text-purple-300 font-semibold mb-4">
                    {dapp.problemSolved}
                  </h2>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm font-medium">
                      {dapp.subCategory}
                    </span>
                    <div className="flex items-center text-sm text-gray-400">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      {dapp.rating} Rating
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="w-4 h-4 mr-1" />
                      {dapp.userCount} Users
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {dapp.description}
                  </p>
                  
                  {/* Supported Blockchains */}
                  <div className="flex flex-wrap gap-2">
                    {dapp.blockchains.map((blockchain) => (
                      <span
                        key={blockchain}
                        className="px-3 py-1 bg-gray-700/50 text-gray-300 text-sm rounded-lg border border-gray-600"
                      >
                        {blockchain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons and Links */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <a
                  href={dapp.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Launch dApp
                </a>
                <button className="px-6 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                  Add to Favorites
                </button>
                
                {/* Links & Community Icons */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-700">
                  {dapp.githubUrl && (
                    <a
                      href={dapp.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {dapp.twitterUrl && (
                    <a
                      href={dapp.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {dapp.documentationUrl && (
                    <a
                      href={dapp.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Documentation"
                    >
                      <BookOpen className="w-5 h-5" />
                    </a>
                  )}
                  {dapp.discordUrl && (
                    <a
                      href={dapp.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Discord"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                  <a
                    href={dapp.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                    title="Website"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Flows Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">User Flows & Tutorials</h2>
              <Link 
                to={`/dapp/${dapp.id}/flows`} 
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                View All Flows →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dapp.flows.map((flow, index) => (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:bg-gray-800/70 hover:border-gray-600 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
                >
                  <Link to={`/flow/${flow.id}`} className="block">
                    {/* Thumbnail */}
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={flow.thumbnail}
                        alt={flow.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>

                      {/* Duration and Difficulty */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
                          {flow.duration}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded backdrop-blur-sm ${getDifficultyColor(flow.difficulty)}`}>
                          {flow.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                        {flow.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {flow.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DAppSpotlight;