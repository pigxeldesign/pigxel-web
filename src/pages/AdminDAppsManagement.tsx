import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  Upload,
  Settings,
  Calendar,
  Users,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';

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
  is_new: boolean;
  is_featured: boolean;
  live_url: string;
  github_url?: string;
  twitter_url?: string;
  documentation_url?: string;
  discord_url?: string;
  founded?: string;
  team?: string;
  total_value_locked?: string;
  daily_active_users?: string;
  transactions?: string;
  audits?: string[];
  licenses?: string[];
  created_at: string;
  updated_at: string;
}

interface FilterState {
  category: string;
  blockchains: string[];
  featured: string;
  isNew: string;
}

interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

const AdminDAppsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [dapps, setDApps] = useState<DApp[]>([]);
  const [filteredDApps, setFilteredDApps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDApps, setSelectedDApps] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortState, setSortState] = useState<SortState>({ field: 'updated_at', direction: 'desc' });
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    blockchains: [],
    featured: '',
    isNew: ''
  });

  // Available filter options
  const blockchains = ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Avalanche', 'Solana'];
  const featuredOptions = ['All', 'Featured', 'Not Featured'];
  const newOptions = ['All', 'New', 'Established'];

  useEffect(() => {
    loadDApps();
  }, []);

  useEffect(() => {
    filterAndSortDApps();
  }, [dapps, searchTerm, filters, sortState]);

  useEffect(() => {
    setShowBulkActions(selectedDApps.size > 0);
  }, [selectedDApps]);

  const loadDApps = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading dApps from Supabase...');
      
      const { data, error } = await supabase
        .from('dapps')
        .select(`
          *,
          category:categories(id, title, slug)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('dApps loaded:', data);
      setDApps(data || []);
    } catch (error: any) {
      console.error('Error loading dApps:', error);
      setError('Failed to load dApps. Please try again.');
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
        dapp.blockchains.some(blockchain => blockchain.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(dapp => dapp.category_id === filters.category);
    }

    // Blockchain filter
    if (filters.blockchains.length > 0) {
      filtered = filtered.filter(dapp => 
        dapp.blockchains.some(blockchain => filters.blockchains.includes(blockchain))
      );
    }

    // Featured filter
    if (filters.featured && filters.featured !== 'All') {
      const isFeatured = filters.featured === 'Featured';
      filtered = filtered.filter(dapp => dapp.is_featured === isFeatured);
    }

    // New filter
    if (filters.isNew && filters.isNew !== 'All') {
      const isNew = filters.isNew === 'New';
      filtered = filtered.filter(dapp => dapp.is_new === isNew);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortState.field as keyof DApp];
      let bValue: any = b[sortState.field as keyof DApp];

      if (sortState.field === 'updated_at' || sortState.field === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortState.field === 'category') {
        aValue = a.category?.title || '';
        bValue = b.category?.title || '';
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortState.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDApps(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (field: string) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    const currentPageDApps = getCurrentPageDApps();
    const currentPageIds = new Set(currentPageDApps.map(dapp => dapp.id));
    
    if (currentPageIds.size > 0 && [...currentPageIds].every(id => selectedDApps.has(id))) {
      // Deselect all on current page
      setSelectedDApps(prev => {
        const newSet = new Set(prev);
        currentPageIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all on current page
      setSelectedDApps(prev => new Set([...prev, ...currentPageIds]));
    }
  };

  const handleSelectDApp = (id: string) => {
    setSelectedDApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async (dappId: string) => {
    const dapp = dapps.find(d => d.id === dappId);
    if (!dapp) return;

    if (window.confirm(`Are you sure you want to delete "${dapp.name}"? This action cannot be undone.`)) {
      try {
        console.log('Deleting dApp:', dappId);
        const { error } = await supabase
          .from('dapps')
          .delete()
          .eq('id', dappId);

        if (error) throw error;
        
        console.log('dApp deleted successfully');
        await loadDApps();
        
        // Remove from selected dApps if it was selected
        setSelectedDApps(prev => {
          const newSet = new Set(prev);
          newSet.delete(dappId);
          return newSet;
        });
      } catch (error: any) {
        console.error('Error deleting dApp:', error);
        setError(error.message || 'Failed to delete dApp. Please try again.');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      blockchains: [],
      featured: '',
      isNew: ''
    });
    setSearchTerm('');
  };

  const getCurrentPageDApps = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDApps.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredDApps.length / itemsPerPage);

  const getSortIcon = (field: string) => {
    if (sortState.field !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortState.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : value && value !== 'All'
  ).length + (searchTerm ? 1 : 0);

  // Get unique categories for filter dropdown
  const categories = Array.from(
    new Map(
      dapps
        .filter(dapp => dapp.category)
        .map(dapp => [dapp.category!.id, dapp.category!])
    ).values()
  );

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">dApps Management</h1>
            <p className="text-gray-400">
              Manage and organize all decentralized applications in your directory
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button 
              onClick={() => navigate('/admin/dapps/new')}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add dApp
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-600/20 border border-red-600/30 rounded-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dApps by name, description, category, or blockchain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 border rounded-lg font-medium transition-colors ${
                  activeFiltersCount > 0 || showFilters
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-700 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Featured</label>
                    <select
                      value={filters.featured}
                      onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {featuredOptions.map(option => (
                        <option key={option} value={option === 'All' ? '' : option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* New Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={filters.isNew}
                      onChange={(e) => setFilters(prev => ({ ...prev, isNew: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {newOptions.map(option => (
                        <option key={option} value={option === 'All' ? '' : option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Blockchain Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Blockchains</label>
                  <div className="flex flex-wrap gap-2">
                    {blockchains.map(blockchain => (
                      <button
                        key={blockchain}
                        onClick={() => {
                          setFilters(prev => ({
                            ...prev,
                            blockchains: prev.blockchains.includes(blockchain)
                              ? prev.blockchains.filter(b => b !== blockchain)
                              : [...prev.blockchains, blockchain]
                          }));
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          filters.blockchains.includes(blockchain)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {blockchain}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {showBulkActions && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-purple-300 font-medium">
                    {selectedDApps.size} dApp{selectedDApps.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      Feature
                    </button>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      Mark New
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDApps(new Set())}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-400">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDApps.length)}-{Math.min(currentPage * itemsPerPage, filteredDApps.length)} of {filteredDApps.length} dApps
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50 border-b border-gray-600">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={getCurrentPageDApps().length > 0 && getCurrentPageDApps().every(dapp => selectedDApps.has(dapp.id))}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-gray-300 font-medium">Logo</th>
                      <th className="text-left px-4 py-3 text-gray-300 font-medium">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          Name
                          {getSortIcon('name')}
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-gray-300 font-medium">
                        <button
                          onClick={() => handleSort('category')}
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          Category
                          {getSortIcon('category')}
                        </button>
                      </th>
                      <th className="text-left px-4 py-3 text-gray-300 font-medium">Status</th>
                      <th className="text-left px-4 py-3 text-gray-300 font-medium">Rating</th>
                      <th className="text-left px-4 py-3 text-gray-300 font-medium">
                        <button
                          onClick={() => handleSort('updated_at')}
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          Last Updated
                          {getSortIcon('updated_at')}
                        </button>
                      </th>
                      <th className="text-right px-4 py-3 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageDApps().map((dapp, index) => (
                      <motion.tr
                        key={dapp.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors group"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedDApps.has(dapp.id)}
                            onChange={() => handleSelectDApp(dapp.id)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg overflow-hidden">
                              {dapp.logo_url ? (
                                <img 
                                  src={dapp.logo_url} 
                                  alt={dapp.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-400">📱</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {dapp.name}
                              {dapp.is_featured && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              )}
                              {dapp.is_new && (
                                <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {dapp.problem_solved}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full">
                            {dapp.category?.title || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-400">
                              {dapp.sub_category}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {dapp.blockchains.slice(0, 2).map((blockchain) => (
                                <span
                                  key={blockchain}
                                  className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded"
                                >
                                  {blockchain}
                                </span>
                              ))}
                              {dapp.blockchains.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                                  +{dapp.blockchains.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-white text-sm">N/A</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-400 text-sm">
                          {formatDate(dapp.updated_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => navigate(`/dapp/${dapp.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                              title="View Live"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => navigate(`/admin/dapps/edit/${dapp.id}`)}
                              className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(dapp.id)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600/20 rounded-lg transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredDApps.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {dapps.length === 0 ? 'No dApps yet' : 'No dApps found'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {dapps.length === 0 
                      ? 'Create your first dApp to get started.'
                      : 'Try adjusting your filters to find dApps.'
                    }
                  </p>
                  {dapps.length === 0 ? (
                    <button
                      onClick={() => navigate('/admin/dapps/new')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create First dApp
                    </button>
                  ) : (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
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
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
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
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDAppsManagement;