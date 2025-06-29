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
  Loader2,
  Calendar,
  Shield,
  Info,
  AlertCircle,
  Clock
} from 'lucide-react';
import FlowDetailModal from '../components/FlowDetailModal';
import { supabase } from '../lib/supabase';
import ComingSoonModal from '../components/ComingSoonModal';
import { isValidSafeUrl, isProduction } from '../lib/supabase';

interface DApp {
  id: string;
  name: string;
  description: string;
  problem_solved: string;
  logo_url?: string;
  thumbnail_url?: string;
  category_id?: string;
  category?: {
    id: string;
    title: string;
    slug: string;
  };
  sub_category: string;
  blockchains: string[];
  rating?: number;
  user_count?: string;
  is_new?: boolean;
  is_featured?: boolean;
  live_url: string;
  github_url?: string;
  twitter_url?: string;
  documentation_url?: string;
  discord_url?: string;
  created_at: string;
  updated_at: string;
  flows: Flow[];
}

interface Flow {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  screen_count: number;
  is_premium: boolean;
  screens: FlowScreen[];
  created_at: string;
  updated_at: string;
}

interface FlowScreen {
  id: string;
  flow_id: string;
  order_index: number;
  thumbnail_url: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const DAppSpotlight: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dapp, setDApp] = useState<DApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlides, setCurrentSlides] = useState<Record<string, number>>({});
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [selectedScreenIndex, setSelectedScreenIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  useEffect(() => {
    // Fetch dApp data from Supabase
    fetchDAppData();
  }, [id]);

  const fetchDAppData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!id) throw new Error('No dApp ID provided');
      
      // Fetch dApp with its category
      const { data: dappData, error: dappError } = await supabase
        .from('dapp_with_categories')
        .select(`
          *,
          category_title,
          category_slug
        `)
        .eq('id', id)
        .single();
      
      if (dappError) throw dappError;
      if (!dappData) throw new Error('dApp not found');
      
      // Fetch flows for this dApp
      const { data: flowsData, error: flowsError } = await supabase
        .from('flows')
        .select('*')
        .eq('dapp_id', id)
        .order('created_at', { ascending: false });
      
      if (flowsError) throw flowsError;
      
      // For each flow, fetch its screens
      const flowsWithScreens = await Promise.all(
        (flowsData || []).map(async (flow) => {
          const { data: screensData, error: screensError } = await supabase
            .from('flow_screens')
            .select('*')
            .eq('flow_id', flow.id)
            .order('order_index');
          
          if (screensError) throw screensError;
          
          // Transform screens data to match our interface
          const screens = (screensData || []).map(screen => ({
            id: screen.id,
            flow_id: screen.flow_id,
            order_index: screen.order_index,
            thumbnail: screen.thumbnail_url,
            thumbnail_url: screen.thumbnail_url,
            title: screen.title,
            description: screen.description,
            created_at: screen.created_at,
            updated_at: screen.updated_at
          }));
          
          return {
            ...flow,
            screens
          };
        })
      );
      
      // Transform dApp data to match our interface
      const transformedDApp: DApp = {
        id: dappData.id,
        name: dappData.name,
        description: dappData.description,
        problem_solved: dappData.problem_solved,
        problemSolved: dappData.problem_solved, // For backward compatibility
        logo_url: dappData.logo_url,
        logo: dappData.logo_url || '📱', // Fallback emoji if no logo
        thumbnail_url: dappData.thumbnail_url,
        thumbnail: dappData.thumbnail_url || 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop', // Fallback image
        category_id: dappData.category_id || null,
        category: {
          id: dappData.category_id || '',
          title: dappData.category_title || 'Uncategorized',
          slug: dappData.category_slug || 'uncategorized'
        },
        sub_category: dappData.sub_category,
        subCategory: dappData.sub_category, // For backward compatibility
        blockchains: dappData.blockchains || [],
        rating: dappData.rating || 0,
        user_count: dappData.user_count,
        userCount: dappData.user_count || '0', // For backward compatibility
        is_new: dappData.is_new,
        is_featured: dappData.is_featured,
        live_url: dappData.live_url,
        liveUrl: dappData.live_url, // For backward compatibility
        github_url: dappData.github_url,
        githubUrl: dappData.github_url, // For backward compatibility
        twitter_url: dappData.twitter_url,
        twitterUrl: dappData.twitter_url, // For backward compatibility
        documentation_url: dappData.documentation_url,
        documentationUrl: dappData.documentation_url, // For backward compatibility
        discord_url: dappData.discord_url,
        discordUrl: dappData.discord_url, // For backward compatibility
        created_at: dappData.created_at,
        updated_at: dappData.updated_at,
        flows: flowsWithScreens
      };
      
      setDApp(transformedDApp);
      
      // Initialize slide positions
      const initialSlides: Record<string, number> = {};
      flowsWithScreens.forEach(flow => {
        initialSlides[flow.id] = 0;
      });
      setCurrentSlides(initialSlides);
      
    } catch (err: any) {
      if (!isProduction()) {
        console.error('Error fetching dApp data:', err);
      } else {
        console.error('Error fetching dApp data:', err.message || 'Failed to load dApp data');
      }
      setError(err.message || 'Failed to load dApp data');
    } finally {
      setLoading(false);
    }
  };

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

  const handleAIComparisonClick = () => {
    setIsComingSoonModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error || !dapp) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'dApp Not Found'}
          </h1>
          <p className="text-gray-400 mb-6">
            We couldn't find the dApp you're looking for. It may have been removed or the URL might be incorrect.
          </p>
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
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6 overflow-x-auto"
          >
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/category/${dapp.category.slug}`} className="hover:text-white transition-colors">
              {dapp.category.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white truncate">{dapp.name}</span>
          </motion.nav>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-purple-500/20"
          >
            <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6">
              {/* Logo and Basic Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 overflow-hidden">
                  {dapp.logo_url ? (
                    <img 
                      src={isValidSafeUrl(dapp.logo_url) ? dapp.logo_url : ''} 
                      alt={dapp.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    '📱'
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{dapp.name}</h1>
                  <h2 className="text-lg sm:text-xl lg:text-2xl text-purple-300 font-semibold mb-3 sm:mb-4">
                    {dapp.problem_solved}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <span className="px-3 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm font-medium">
                      {dapp.sub_category}
                    </span>
                    {dapp.is_new && (
                      <span className="px-2 py-1 bg-green-600/30 text-green-200 rounded-full text-xs">
                        New
                      </span>
                    )}
                    {dapp.is_featured && (
                      <span className="px-2 py-1 bg-yellow-600/30 text-yellow-200 rounded-full text-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                    {dapp.description}
                  </p>
                  
                  {/* Supported Blockchains */}
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {dapp.blockchains.map((blockchain) => (
                      <span
                        key={blockchain}
                        className="px-2 sm:px-3 py-1 bg-gray-700/50 text-gray-300 text-xs sm:text-sm rounded-lg border border-gray-600"
                      >
                        {blockchain}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons and Links */}
              <div className="w-full lg:w-auto flex flex-col gap-3 lg:min-w-[200px]">
                <a
                  href={isValidSafeUrl(dapp.live_url) ? dapp.live_url : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Launch dApp
                </a>
                
                {/* Links & Community Icons */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-700">
                  {dapp.github_url && (
                    <a 
                      href={isValidSafeUrl(dapp.github_url) ? dapp.github_url : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {dapp.twitter_url && (
                    <a
                      href={isValidSafeUrl(dapp.twitter_url) ? dapp.twitter_url : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {dapp.documentation_url && (
                    <a
                      href={isValidSafeUrl(dapp.documentation_url) ? dapp.documentation_url : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Documentation"
                    >
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {dapp.discord_url && (
                    <a
                      href={isValidSafeUrl(dapp.discord_url) ? dapp.discord_url : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 sm:p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                      title="Discord"
                    >
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  <a
                    href={isValidSafeUrl(dapp.live_url) ? dapp.live_url : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 sm:p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                    title="Website"
                  >
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Information */}

          {/* Flows Gallery */}
          {dapp.flows && dapp.flows.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4 sm:mb-6"
            >
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">User Flows & Tutorials</h2>
              </div>
              
              <div className="space-y-6 sm:space-y-8">
                {dapp.flows.map((flow, index) => (
                  <motion.div
                    key={flow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 sm:p-6 hover:bg-gray-800/70 hover:border-gray-600 transition-all duration-300"
                  >
                    {/* Flow Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white">{flow.title}</h3>
                        {flow.is_premium && (
                          <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <span className="text-gray-400">{flow.screen_count} screens</span>
                        <span className="px-2 py-1 bg-black/50 text-white rounded">
                          {flow.duration}
                        </span>
                        <span className={`px-2 py-1 rounded ${getDifficultyColor(flow.difficulty)}`}>
                          {flow.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Carousel Container */}
                    {flow.screens && flow.screens.length > 0 ? (
                      <div className="relative">
                        {/* Navigation Buttons */}
                        {currentSlides[flow.id] > 0 && (
                          <button
                            onClick={() => prevSlide(flow.id)}
                            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                        
                        {currentSlides[flow.id] < flow.screens.length - 3 && (
                          <button
                            onClick={() => nextSlide(flow.id, flow.screens.length)}
                            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 sm:w-8 sm:h-8 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}

                        {/* Screens Carousel */}
                        <div className="overflow-hidden rounded-lg">
                          <motion.div
                            className="flex gap-2 sm:gap-4"
                            animate={{
                              x: `${-currentSlides[flow.id] * (100 / Math.min(3, flow.screens.length))}%`
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ width: `${(flow.screens.length / Math.min(3, flow.screens.length)) * 100}%` }}
                          >
                            {flow.screens.map((screen, screenIndex) => (
                              <motion.div
                                key={screen.id}
                                className="flex-shrink-0 cursor-pointer group"
                                style={{ width: `${100 / flow.screens.length}%` }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleScreenClick(flow, screenIndex)}
                              >
                                <div className="relative aspect-[4/3] rounded-md sm:rounded-lg overflow-hidden border border-gray-600 group-hover:border-purple-500 transition-colors">
                                  <img
                                    src={isValidSafeUrl(screen.thumbnail_url) ? screen.thumbnail_url : ''}
                                    alt={screen.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      // Fallback image if the thumbnail fails to load
                                      e.currentTarget.src = 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                  
                                  {/* Play Button Overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white ml-0.5" />
                                    </div>
                                  </div>

                                  {/* Screen Title */}
                                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                                    <p className="text-white text-xs sm:text-sm font-medium truncate">
                                      {screen.title}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm">No screens available for this flow</p>
                      </div>
                    )}

                    {/* Flow Description */}
                    <span 
                      className="flex items-center gap-2 justify-end cursor-pointer mt-3 sm:mt-4"
                      onClick={handleAIComparisonClick}
                    >
                      <p className="text-gray-400 text-xs sm:text-sm flex-1">{flow.description}</p>
                      <img
                        src="/ChatGPT_Image_29_Jun_2025__15.05.43-removebg-preview.png"
                        alt="AI Comparison Flow"
                        width={20}
                        height={20}
                      />
                      <span className="text-blue-500 hover:underline text-xs sm:text-sm">AI Comparison Flow</span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 sm:mb-8 bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center"
            >
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-bold text-white mb-2">No Flows Available</h3>
              <p className="text-gray-400 mb-2">
                This dApp doesn't have any user flows or tutorials yet.
              </p>
              <p className="text-gray-500 text-sm">
                Check back later for step-by-step guides on how to use {dapp.name}.
              </p>
            </motion.div>
          )}
          
          {/* AI Comparison Flow Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 sm:p-6 border border-blue-500/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">AI-Powered Comparison</h3>
                  <p className="text-gray-300 text-sm sm:text-base">
                    Compare this dApp with similar alternatives using our AI-powered analysis tool.
                  </p>
                </div>
                <button 
                  onClick={handleAIComparisonClick}
                  className="flex items-center px-4 sm:px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-blue-600/10 hover:text-blue-300 rounded-lg font-medium transition-colors text-sm sm:text-base group"
                >
                  <img 
                    src="/ChatGPT_Image_29_Jun_2025__15.05.43-removebg-preview.png" 
                    alt="" 
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform opacity-90 group-hover:opacity-100"
                  />
                  AI Comparison Flow
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* Creation Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center text-xs text-gray-500 mt-8 mb-4"
          >
            <p>Added on {formatDate(dapp.created_at)} • Last updated {formatDate(dapp.updated_at)}</p>
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
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />
    </div>
  );
};

export default DAppSpotlight;