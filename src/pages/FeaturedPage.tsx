import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  Star,
  Users,
  ExternalLink,
  Loader2,
  Grid3X3,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, isValidSafeUrl, isProduction } from '../lib/supabase';

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
  is_new?: boolean;
  is_featured?: boolean;
  live_url: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon_name: string;
  color_gradient: string;
}

const FeaturedPage: React.FC = () => {
  const [dapps, setDApps] = useState<DApp[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredDApps, setFilteredDApps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBlockchains, setSelectedBlockchains] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const allBlockchains = ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Solana', 'Avalanche', 'Bitcoin'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortDApps();
  }, [dapps, searchTerm, selectedCategories, selectedBlockchains, sortBy]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('title');
      
      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load only featured dApps
      const { data: dappsData, error: dappsError } = await supabase
        .from('dapps')
        .select(`
          *,
          categories(id, title, slug)
        `)
        .eq('is_featured', true)
        .order('updated_at', { ascending: false });
      
      if (dappsError) throw dappsError;

      // Transform data to match our interface
      const transformedDApps: DApp[] = (dappsData || []).map(dapp => ({
        id: dapp.id,
        name: dapp.name,
        description: dapp.description,
        problem_solved: dapp.problem_solved,
        logo_url: dapp.logo_url,
        thumbnail_url: dapp.thumbnail_url,
        category_id: dapp.category_id,
        category: dapp.categories ? {
          id: dapp.categories.id,
          title: dapp.categories.title,
          slug: dapp.categories.slug
        } : undefined,
        sub_category: dapp.sub_category,
        blockchains: dapp.blockchains || [],
        is_new: dapp.is_new,
        is_featured: dapp.is_featured,
        live_url: dapp.live_url,
        created_at: dapp.created_at,
        updated_at: dapp.updated_at
      }));

      setDApps(transformedDApps);
      console.log('Loaded featured dApps:', transformedDApps);
    } catch (err: any) {
      if (!isProduction()) {
        console.error('Error loading data:', err);
      } else {
        console.error('Error loading data:', err.message || 'Failed to load data');
      }
      setError('Failed to load featured dApps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDApps = () => {
    let filtered = [...dapps];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dapp => 
        dapp.name.toLowerCase().includes(term) ||
        dapp.description.toLowerCase().includes(term) ||
        dapp.problem_solved.toLowerCase().includes(term) ||
        dapp.category?.title.toLowerCase().includes(term) ||
        dapp.sub_category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(dapp => 
        dapp.category_id && selectedCategories.includes(dapp.category_id)
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
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    setFilteredDApps(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleBlockchain = (blockchain: string) => {
    setSelectedBlockchains(prev => 
      prev.includes(blockchain) 
        ? prev.filter(b => b !== blockchain)
        : [...prev, blockchain]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBlockchains([]);
    setSortBy('newest');
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedBlockchains.length > 0;

  // Pagination
  const totalPages = Math.ceil(filteredDApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDApps = filteredDApps.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading featured dApps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Featured dApps</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-yellow-500 fill-current" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Featured dApps
              </h1>
            </div>
            <p className="text-gray-300 text-lg sm:text-xl mb-6">
              Discover the most popular and innovative decentralized applications, handpicked by our team
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search featured dApps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="flex items-center px-4 py-3 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-4 py-3 border rounded-lg font-medium transition-colors ${
                    hasActiveFilters || showFilters
                      ? 'bg-purple-600 border-purple-600 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-1 rounded-full">
                      {selectedCategories.length + selectedBlockchains.length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest</option>
                  <option value="alphabetical">Alphabetical</option>
                  <option value="rating">Highest Rated</option>
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
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Categories */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Categories</h3>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center p-2 hover:bg-gray-700/50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => toggleCategory(category.id)}
                              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-3"
                            />
                            <span className="text-gray-300 text-sm">{category.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Blockchains */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Blockchains</h3>
                      <div className="flex flex-wrap gap-2">
                        {allBlockchains.map((blockchain) => (
                          <button
                            key={blockchain}
                            onClick={() => toggleBlockchain(blockchain)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <button
                        onClick={clearAllFilters}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
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
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <span
                      key={categoryId}
                      className="flex items-center px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm"
                    >
                      {category.title}
                      <button
                        onClick={() => toggleCategory(categoryId)}
                        className="ml-2 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ) : null;
                })}
                {selectedBlockchains.map((blockchain) => (
                  <span
                    key={blockchain}
                    className="flex items-center px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
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

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
              <span>
                Showing {Math.min(startIndex + 1, filteredDApps.length)}-{Math.min(endIndex, filteredDApps.length)} of {filteredDApps.length} featured dApps
              </span>
              {totalPages > 1 && (
                <span>Page {currentPage} of {totalPages}</span>
              )}
            </div>
          </motion.div>

          {/* Results */}
          {filteredDApps.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-white mb-2">No featured dApps found</h3>
              <p className="text-gray-400 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to find featured dApps.'
                  : 'No featured dApps are currently available.'
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </motion.div>
          ) : (
            <>
              {/* dApps Grid/List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
                }
              >
                {currentDApps.map((dapp, index) => (
                  <motion.div
                    key={dapp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className={`group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:bg-gray-800/70 hover:border-gray-600 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer ${
                      viewMode === 'list' ? 'flex items-center p-4' : ''
                    }`}
                  >
                    <Link to={`/dapp/${dapp.id}`} className={`block ${viewMode === 'list' ? 'flex items-center w-full' : ''}`}>
                      {viewMode === 'grid' ? (
                        <>
                          {/* Thumbnail Image */}
                          <div className="relative w-full h-48 overflow-hidden">
                            <img
                              src={isValidSafeUrl(dapp.thumbnail_url || '') ? dapp.thumbnail_url : ''}
                              alt={dapp.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            
                            {/* Featured badge */}
                            <div className="absolute top-3 right-3">
                              <span className="px-2 py-1 bg-yellow-600/90 text-yellow-100 text-xs rounded-full backdrop-blur-sm">
                                Featured
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Logo and Title */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-lg overflow-hidden">
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
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                  {dapp.name}
                                </h3>
                              </div>
                            </div>

                            {/* Problem Solved */}
                            <p className="text-sm text-purple-400 mb-3 line-clamp-2">
                              {dapp.problem_solved}
                            </p>

                            {/* Category and User Count */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                                {dapp.category?.title || 'Uncategorized'}
                              </span>
                            </div>

                            {/* Blockchains */}
                            <div className="flex flex-wrap gap-1">
                              {dapp.blockchains.slice(0, 3).map((blockchain) => (
                                <span
                                  key={blockchain}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
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
                        </>
                      ) : (
                        /* List View */
                        <>
                          {/* Logo */}
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-xl overflow-hidden mr-4 flex-shrink-0">
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

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                                  {dapp.name}
                                </h3>
                                <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded-full">
                                  Featured
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-purple-400 text-sm mb-2 line-clamp-1">
                              {dapp.problem_solved}
                            </p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                                {dapp.category?.title || 'Uncategorized'}
                              </span>
                              <div className="flex gap-1">
                                {dapp.blockchains.slice(0, 2).map((blockchain) => (
                                  <span
                                    key={blockchain}
                                    className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                                  >
                                    {blockchain}
                                  </span>
                                ))}
                                {dapp.blockchains.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{dapp.blockchains.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* External Link */}
                          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-5 h-5 text-gray-400" />
                          </div>
                        </>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex items-center justify-center mt-12 gap-2"
                >
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedPage;