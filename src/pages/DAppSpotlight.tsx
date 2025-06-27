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
  ChevronLeft,
  Play,
  BookOpen,
  MessageCircle,
  Loader2
} from 'lucide-react';
import FlowDetailModal from '../components/FlowDetailModal';

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
  screens: FlowScreen[];
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  screenCount: number;
}

interface FlowScreen {
  id: string;
  thumbnail: string;
  title: string;
  description?: string;
}

const DAppSpotlight: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dapp, setDApp] = useState<DApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlides, setCurrentSlides] = useState<Record<string, number>>({});
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data with multiple screens per flow
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
        title: 'Token Swapping',
        description: 'Complete guide to swapping tokens on Uniswap. Learn how to connect your wallet, select tokens, set amounts, and execute swaps safely.',
        duration: '3 min',
        difficulty: 'Beginner',
        screenCount: 5,
        screens: [
          { 
            id: '1-1', 
            thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Connect Wallet',
            description: 'Start by connecting your Web3 wallet to access Uniswap'
          },
          { 
            id: '1-2', 
            thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Select Tokens',
            description: 'Choose the tokens you want to swap from and to'
          },
          { 
            id: '1-3', 
            thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Enter Amount',
            description: 'Specify the amount you want to trade'
          },
          { 
            id: '1-4', 
            thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Review Swap',
            description: 'Check the swap details, fees, and price impact'
          },
          { 
            id: '1-5', 
            thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Confirm Transaction',
            description: 'Approve and execute the swap transaction'
          }
        ]
      },
      {
        id: '2',
        title: 'Providing Liquidity',
        description: 'Learn how to provide liquidity and earn fees. Understand price ranges, impermanent loss, and position management.',
        duration: '5 min',
        difficulty: 'Intermediate',
        screenCount: 6,
        screens: [
          { 
            id: '2-1', 
            thumbnail: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Pool Selection',
            description: 'Choose the liquidity pool you want to provide to'
          },
          { 
            id: '2-2', 
            thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Add Liquidity',
            description: 'Navigate to the add liquidity interface'
          },
          { 
            id: '2-3', 
            thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Set Price Range',
            description: 'Define the price range for your liquidity position'
          },
          { 
            id: '2-4', 
            thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Deposit Amounts',
            description: 'Enter the amounts of each token to deposit'
          },
          { 
            id: '2-5', 
            thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Approve Tokens',
            description: 'Approve the smart contract to spend your tokens'
          },
          { 
            id: '2-6', 
            thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Add Position',
            description: 'Confirm and create your liquidity position'
          }
        ]
      },
      {
        id: '3',
        title: 'Understanding Fees',
        description: 'Learn about gas fees and slippage. Master the art of optimizing transaction costs and timing.',
        duration: '4 min',
        difficulty: 'Beginner',
        screenCount: 4,
        screens: [
          { 
            id: '3-1', 
            thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Gas Settings',
            description: 'Understand and adjust gas fees for your transactions'
          },
          { 
            id: '3-2', 
            thumbnail: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Slippage Tolerance',
            description: 'Set appropriate slippage tolerance for your trades'
          },
          { 
            id: '3-3', 
            thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Transaction Preview',
            description: 'Review all fees and costs before confirming'
          },
          { 
            id: '3-4', 
            thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Fee Breakdown',
            description: 'Understand the different types of fees involved'
          }
        ]
      },
      {
        id: '4',
        title: 'Advanced Trading',
        description: 'Advanced techniques for experienced traders. Learn about MEV protection, limit orders, and portfolio optimization.',
        duration: '8 min',
        difficulty: 'Advanced',
        screenCount: 7,
        screens: [
          { 
            id: '4-1', 
            thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Market Analysis',
            description: 'Analyze market conditions and trading opportunities'
          },
          { 
            id: '4-2', 
            thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Price Charts',
            description: 'Read and interpret price charts and indicators'
          },
          { 
            id: '4-3', 
            thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Limit Orders',
            description: 'Set up limit orders for better price execution'
          },
          { 
            id: '4-4', 
            thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'MEV Protection',
            description: 'Protect your trades from MEV attacks'
          },
          { 
            id: '4-5', 
            thumbnail: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Multi-hop Swaps',
            description: 'Execute complex multi-step trading strategies'
          },
          { 
            id: '4-6', 
            thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Portfolio Tracking',
            description: 'Monitor and analyze your trading performance'
          },
          { 
            id: '4-7', 
            thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop', 
            title: 'Risk Management',
            description: 'Implement proper risk management strategies'
          }
        ]
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setDApp(mockDApp);
      // Initialize slide positions
      const initialSlides: Record<string, number> = {};
      mockDApp.flows.forEach(flow => {
        initialSlides[flow.id] = 0;
      });
      setCurrentSlides(initialSlides);
      setLoading(false);
    }, 1000);
  }, [id]);

  const nextSlide = (flowId: string, maxSlides: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [flowId]: Math.min(prev[flowId] + 1, maxSlides - 3)
    }));
  };

  const prevSlide = (flowId: string) => {
    setCurrentSlides(prev => ({
      ...prev,
      [flowId]: Math.max(prev[flowId] - 1, 0)
    }));
  };

  const handleScreenClick = (flow: Flow, screenIndex: number) => {
    setSelectedFlow({ ...flow, dappName: dapp?.name });
    setSelectedScreenIndex(screenIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFlow(null);
    setSelectedScreenIndex(0);
  };

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
            
            <div className="space-y-8">
              {dapp.flows.map((flow, index) => (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 hover:border-gray-600 transition-all duration-300"
                >
                  {/* Flow Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-white">{flow.title}</h3>
                      <span className="text-sm text-gray-400">from {flow.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">{flow.screenCount} screens</span>
                      <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                        {flow.duration}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getDifficultyColor(flow.difficulty)}`}>
                        {flow.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Carousel Container */}
                  <div className="relative">
                    {/* Navigation Buttons */}
                    {currentSlides[flow.id] > 0 && (
                      <button
                        onClick={() => prevSlide(flow.id)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    
                    {currentSlides[flow.id] < flow.screens.length - 3 && (
                      <button
                        onClick={() => nextSlide(flow.id, flow.screens.length)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {/* Screens Carousel */}
                    <div className="overflow-hidden rounded-lg">
                      <motion.div
                        className="flex gap-4"
                        animate={{
                          x: `${-currentSlides[flow.id] * (100 / 3)}%`
                        }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ width: `${(flow.screens.length / 3) * 100}%` }}
                      >
                        {flow.screens.map((screen, screenIndex) => (
                          <motion.div
                            key={screen.id}
                            className="flex-shrink-0 cursor-pointer group"
                            style={{ width: `${100 / flow.screens.length}%` }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleScreenClick(flow, screenIndex)}
                          >
                            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-600 group-hover:border-purple-500 transition-colors">
                              <img
                                src={screen.thumbnail}
                                alt={screen.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-10 h-10 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                                  <Play className="w-4 h-4 text-white ml-0.5" />
                                </div>
                              </div>

                              {/* Screen Title */}
                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white text-sm font-medium truncate">
                                  {screen.title}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  {/* Flow Description */}
                  <p className="text-gray-400 text-sm mt-4">{flow.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Flow Detail Modal */}
      <FlowDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        flow={selectedFlow}
        initialScreenIndex={selectedScreenIndex}
      />
    </div>
  );
};

export default DAppSpotlight;