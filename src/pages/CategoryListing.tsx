import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  Star,
  Users,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { 
  GraduationCap, 
  Wallet, 
  Users as UsersIcon, 
  Palette, 
  Database, 
  Globe 
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
  isNew?: boolean;
  isFeatured?: boolean;
}

interface Category {
  slug: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  subCategories: string[];
}

const CategoryListing: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [dApps, setDApps] = useState<DApp[]>([]);
  const [filteredDApps, setFilteredDApps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedBlockchains, setSelectedBlockchains] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Category definitions
  const categories: Record<string, Category> = {
    'getting-started': {
      slug: 'getting-started',
      title: 'Getting Started with Web3',
      description: 'Learn the basics of decentralized applications and digital ownership with beginner-friendly tools and educational resources.',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-600',
      subCategories: ['Wallets', 'Educational', 'Tutorials', 'Onboarding']
    },
    'digital-assets': {
      slug: 'digital-assets',
      title: 'Managing Your Digital Assets',
      description: 'Learn how to own, trade, and grow your digital property with DeFi protocols, trading platforms, and portfolio management tools.',
      icon: Wallet,
      color: 'from-green-500 to-emerald-600',
      subCategories: ['DeFi', 'Trading', 'Lending', 'Yield Farming', 'Portfolio Management']
    },
    'communities': {
      slug: 'communities',
      title: 'Decentralized Communities',
      description: 'Join and contribute to community-driven organizations, DAOs, and governance platforms that shape the future of collaboration.',
      icon: UsersIcon,
      color: 'from-purple-500 to-violet-600',
      subCategories: ['DAOs', 'Governance', 'Social Networks', 'Forums', 'Voting']
    },
    'creative-publishing': {
      slug: 'creative-publishing',
      title: 'Creative & Publishing',
      description: 'Monetize your creative work through decentralized platforms, NFT marketplaces, and content creation tools.',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      subCategories: ['NFT Marketplaces', 'Content Creation', 'Art Platforms', 'Music', 'Writing']
    },
    'data-infrastructure': {
      slug: 'data-infrastructure',
      title: 'Data & Infrastructure',
      description: 'Build and use decentralized data storage, computing networks, and infrastructure services for Web3 applications.',
      icon: Database,
      color: 'from-orange-500 to-red-600',
      subCategories: ['Storage', 'Computing', 'Oracles', 'Analytics', 'APIs']
    },
    'real-world-apps': {
      slug: 'real-world-apps',
      title: 'Real-World Applications',
      description: 'Solve everyday problems with blockchain technology through practical applications and utility-focused dApps.',
      icon: Globe,
      color: 'from-teal-500 to-cyan-600',
      subCategories: ['Identity', 'Supply Chain', 'Healthcare', 'Real Estate', 'Gaming']
    }
  };

  const currentCategory = categories[slug || ''];

  // Mock data with thumbnails - in real app, this would come from Supabase
  const mockDApps: DApp[] = [
    {
      id: '1',
      name: 'MetaMask',
      description: 'A crypto wallet & gateway to blockchain apps. Start exploring blockchain applications in seconds.',
      problemSolved: 'Simplifies Web3 onboarding and wallet management for beginners',
      logo: '🦊',
      thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'Wallets',
      blockchains: ['Ethereum', 'Polygon', 'BSC'],
      rating: 4.8,
      userCount: '30M+',
      isFeatured: true
    },
    {
      id: '2',
      name: 'Coinbase Wallet',
      description: 'Your key to the decentralized web. Coinbase Wallet is a self-custody wallet that gives you complete control.',
      problemSolved: 'Provides secure self-custody with user-friendly interface',
      logo: '🔷',
      thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'Wallets',
      blockchains: ['Ethereum', 'Bitcoin', 'Polygon'],
      rating: 4.6,
      userCount: '15M+',
      isNew: true
    },
    {
      id: '3',
      name: 'Rabbithole',
      description: 'Learn to use crypto protocols by completing on-chain tasks and earning rewards.',
      problemSolved: 'Gamifies learning Web3 protocols through hands-on experience',
      logo: '🐰',
      thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'Educational',
      blockchains: ['Ethereum', 'Arbitrum', 'Optimism'],
      rating: 4.7,
      userCount: '500K+',
      isFeatured: true
    },
    {
      id: '4',
      name: 'Buildspace',
      description: 'Learn by building cool stuff. Join thousands of developers building the future of the internet.',
      problemSolved: 'Provides structured learning paths for Web3 development',
      logo: '🚀',
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'Educational',
      blockchains: ['Ethereum', 'Solana', 'Polygon'],
      rating: 4.9,
      userCount: '200K+',
      isNew: true
    },
    {
      id: '5',
      name: 'Uniswap',
      description: 'Swap, earn, and build on the leading decentralized crypto trading protocol.',
      problemSolved: 'Enables permissionless token trading without intermediaries',
      logo: '🦄',
      thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'DeFi',
      blockchains: ['Ethereum', 'Polygon', 'Arbitrum'],
      rating: 4.8,
      userCount: '4M+',
      isFeatured: true
    },
    {
      id: '6',
      name: 'Aave',
      description: 'Earn interest, borrow assets, and build applications on the largest decentralized lending protocol.',
      problemSolved: 'Provides decentralized lending and borrowing without traditional banks',
      logo: '👻',
      thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'Lending',
      blockchains: ['Ethereum', 'Polygon', 'Avalanche'],
      rating: 4.7,
      userCount: '800K+',
      isFeatured: true
    },
    {
      id: '7',
      name: 'OpenSea',
      description: 'The world\'s first and largest digital marketplace for crypto collectibles and non-fungible tokens.',
      problemSolved: 'Democratizes access to NFT trading and discovery',
      logo: '🌊',
      thumbnail: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'NFT Marketplaces',
      blockchains: ['Ethereum', 'Polygon', 'Klaytn'],
      rating: 4.5,
      userCount: '2M+',
      isFeatured: true
    },
    {
      id: '8',
      name: 'Foundation',
      description: 'A platform where artists and collectors can create, discover, and collect digital art NFTs.',
      problemSolved: 'Empowers artists to monetize digital art through NFTs',
      logo: '🎨',
      thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      category: slug || '',
      subCategory: 'Art Platforms',
      blockchains: ['Ethereum'],
      rating: 4.6,
      userCount: '150K+',
      isNew: true
    }
  ];

  const allBlockchains = ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Solana', 'Avalanche', 'Bitcoin'];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setDApps(mockDApps);
      setFilteredDApps(mockDApps);
      setLoading(false);
    }, 1000);
  }, [slug]);

  useEffect(() => {
    let filtered = dApps;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dapp => 
        dapp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dapp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dapp.problemSolved.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sub-category filter
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter(dapp => 
        selectedSubCategories.includes(dapp.subCategory)
      );
    }

    // Blockchain filter
    if (selectedBlockchains.length > 0) {
      filtered = filtered.filter(dapp => 
        dapp.blockchains.some(blockchain => selectedBlockchains.includes(blockchain))
      );
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popular':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    setFilteredDApps(filtered);
  }, [dApps, searchTerm, selectedSubCategories, selectedBlockchains, sortBy]);

  const toggleSubCategory = (subCategory: string) => {
    setSelectedSubCategories(prev => 
      prev.includes(subCategory) 
        ? prev.filter(sc => sc !== subCategory)
        : [...prev, subCategory]
    );
  };

  const toggleBlockchain = (blockchain: string) => {
    setSelectedBlockchains(prev => 
      prev.includes(blockchain) 
        ? prev.filter(bc => bc !== blockchain)
        : [...prev, blockchain]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSubCategories([]);
    setSelectedBlockchains([]);
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || selectedSubCategories.length > 0 || selectedBlockchains.length > 0;

  if (!currentCategory) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Category Not Found</h1>
          <Link to="/" className="text-purple-400 hover:text-purple-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const CategoryIcon = currentCategory.icon;

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
            <span className="text-white truncate">{currentCategory.title}</span>
          </motion.nav>

          {/* Category Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`bg-gradient-to-r ${currentCategory.color}/20 rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-700/50`}
          >
            <div className="flex items-start gap-4 sm:gap-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${currentCategory.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <CategoryIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
                  {currentCategory.title}
                </h1>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-3 sm:mb-4">
                  {currentCategory.description}
                </p>
                <div className="text-xs sm:text-sm text-gray-400">
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading dApps...
                    </div>
                  ) : (
                    `${filteredDApps.length} dApps available`
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={window.innerWidth < 640 ? "Search..." : `Search ${currentCategory.title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-3 border rounded-lg font-medium transition-colors ${
                    hasActiveFilters 
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                  {hasActiveFilters && (
                    <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-1 rounded-full">
                      {selectedSubCategories.length + selectedBlockchains.length}
                    </span>
                  )}
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 sm:px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                >
                  <option value="newest">Newest</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Sub-categories */}
                    <div>
                      <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Sub-categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentCategory.subCategories.map((subCategory) => (
                          <button
                            key={subCategory}
                            onClick={() => toggleSubCategory(subCategory)}
                            className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              selectedSubCategories.includes(subCategory)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {subCategory}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Blockchains */}
                    <div>
                      <h3 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Blockchains</h3>
                      <div className="flex flex-wrap gap-2">
                        {allBlockchains.map((blockchain) => (
                          <button
                            key={blockchain}
                            onClick={() => toggleBlockchain(blockchain)}
                            className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              selectedBlockchains.includes(blockchain)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {blockchain}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
                      <button
                        onClick={clearAllFilters}
                        className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                {selectedSubCategories.map((subCategory) => (
                  <span
                    key={subCategory}
                    className="flex items-center px-2 sm:px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs sm:text-sm"
                  >
                    {subCategory}
                    <button
                      onClick={() => toggleSubCategory(subCategory)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedBlockchains.map((blockchain) => (
                  <span
                    key={blockchain}
                    className="flex items-center px-2 sm:px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs sm:text-sm"
                  >
                    {blockchain}
                    <button
                      onClick={() => toggleBlockchain(blockchain)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full h-40 sm:h-48 bg-gray-700"></div>
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-lg"></div>
                      <div className="h-6 w-16 bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-6 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-700 rounded"></div>
                      <div className="h-6 w-20 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDApps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 sm:py-16"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No dApps found</h3>
              <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {filteredDApps.map((dapp, index) => (
                <motion.div
                  key={dapp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:bg-gray-800/70 hover:border-gray-600 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
                >
                  <Link to={`/dapp/${dapp.id}`} className="block">
                    {/* Thumbnail Image */}
                    <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                      <img
                        src={dapp.thumbnail}
                        alt={dapp.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Status badges */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1">
                        {dapp.isFeatured && (
                          <span className="px-2 py-1 bg-yellow-600/90 text-yellow-100 text-xs rounded-full backdrop-blur-sm">
                            Featured
                          </span>
                        )}
                        {dapp.isNew && (
                          <span className="px-2 py-1 bg-green-600/90 text-green-100 text-xs rounded-full backdrop-blur-sm">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      {/* Logo and Title */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm sm:text-lg">
                            {dapp.logo}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                            {dapp.name}
                          </h3>
                        </div>
                        <div className="flex items-center text-xs text-gray-400">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          {dapp.rating}
                        </div>
                      </div>

                      {/* Problem Solved */}
                      <p className="text-sm text-purple-400 mb-3 line-clamp-2">
                        {dapp.problemSolved}
                      </p>

                      {/* Sub-category and User Count */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                          {dapp.subCategory}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="w-3 h-3 mr-1" />
                          {dapp.userCount}
                        </div>
                      </div>

                      {/* Blockchains */}
                      <div className="flex flex-wrap gap-1 overflow-hidden">
                        {dapp.blockchains.slice(0, 3).map((blockchain) => (
                          <span
                            key={blockchain}
                            className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {blockchain}
                          </span>
                        ))}
                        {dapp.blockchains.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                            +{dapp.blockchains.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryListing;