import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Search, Filter, MoreHorizontal, Eye, EyeOff, Copy, Move, Palette, Hash, Loader2, CircleDot as DragHandleDots2, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  sub_categories: string[];
  dapp_count?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  title: string;
  description: string;
  icon_name: string;
  color_gradient: string;
  sub_categories: string[];
  is_active: boolean;
}

const AdminCategoriesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>({
    title: '',
    description: '',
    icon_name: 'Folder',
    color_gradient: 'from-blue-500 to-cyan-600',
    sub_categories: [],
    is_active: true
  });

  // Available icons and gradients
  const availableIcons = [
    'Folder', 'Star', 'Heart', 'Zap', 'Globe', 'Shield', 'Palette', 'Database',
    'Users', 'Wallet', 'GraduationCap', 'Gamepad2', 'Music', 'Camera', 'Code',
    'Briefcase', 'Home', 'Settings', 'Tool', 'Rocket', 'Crown', 'Diamond'
  ];

  const availableGradients = [
    { name: 'Blue Ocean', value: 'from-blue-500 to-cyan-600' },
    { name: 'Purple Dream', value: 'from-purple-500 to-violet-600' },
    { name: 'Green Forest', value: 'from-green-500 to-emerald-600' },
    { name: 'Pink Sunset', value: 'from-pink-500 to-rose-600' },
    { name: 'Orange Fire', value: 'from-orange-500 to-red-600' },
    { name: 'Teal Wave', value: 'from-teal-500 to-cyan-600' },
    { name: 'Indigo Night', value: 'from-indigo-500 to-purple-600' },
    { name: 'Yellow Sun', value: 'from-yellow-500 to-orange-600' }
  ];

  // Mock data - in real app, this would come from Supabase
  const mockCategories: Category[] = [
    {
      id: '1',
      slug: 'getting-started',
      title: 'Getting Started with Web3',
      description: 'Learn the basics of decentralized applications and digital ownership',
      icon_name: 'GraduationCap',
      color_gradient: 'from-blue-500 to-cyan-600',
      sub_categories: ['Wallets', 'Educational', 'Tutorials', 'Onboarding'],
      dapp_count: 24,
      is_active: true,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-06-28T14:30:00Z'
    },
    {
      id: '2',
      slug: 'digital-assets',
      title: 'Managing Your Digital Assets',
      description: 'Learn how to own, trade, and grow your digital property',
      icon_name: 'Wallet',
      color_gradient: 'from-green-500 to-emerald-600',
      sub_categories: ['DeFi', 'Trading', 'Lending', 'Yield Farming', 'Portfolio Management'],
      dapp_count: 156,
      is_active: true,
      created_at: '2024-02-10T09:15:00Z',
      updated_at: '2024-06-27T16:45:00Z'
    },
    {
      id: '3',
      slug: 'communities',
      title: 'Decentralized Communities',
      description: 'Join and contribute to community-driven organizations',
      icon_name: 'Users',
      color_gradient: 'from-purple-500 to-violet-600',
      sub_categories: ['DAOs', 'Governance', 'Social Networks', 'Forums', 'Voting'],
      dapp_count: 89,
      is_active: true,
      created_at: '2024-03-05T11:30:00Z',
      updated_at: '2024-06-26T12:20:00Z'
    },
    {
      id: '4',
      slug: 'creative-publishing',
      title: 'Creative & Publishing',
      description: 'Monetize your creative work through decentralized platforms',
      icon_name: 'Palette',
      color_gradient: 'from-pink-500 to-rose-600',
      sub_categories: ['NFT Marketplaces', 'Content Creation', 'Art Platforms', 'Music', 'Writing'],
      dapp_count: 67,
      is_active: true,
      created_at: '2024-04-12T08:45:00Z',
      updated_at: '2024-06-25T10:15:00Z'
    },
    {
      id: '5',
      slug: 'data-infrastructure',
      title: 'Data & Infrastructure',
      description: 'Build and use decentralized data storage and computing',
      icon_name: 'Database',
      color_gradient: 'from-orange-500 to-red-600',
      sub_categories: ['Storage', 'Computing', 'Oracles', 'Analytics', 'APIs'],
      dapp_count: 43,
      is_active: false,
      created_at: '2024-05-20T13:20:00Z',
      updated_at: '2024-06-24T09:30:00Z'
    },
    {
      id: '6',
      slug: 'real-world-apps',
      title: 'Real-World Applications',
      description: 'Solve everyday problems with blockchain technology',
      icon_name: 'Globe',
      color_gradient: 'from-teal-500 to-cyan-600',
      sub_categories: ['Identity', 'Supply Chain', 'Healthcare', 'Real Estate', 'Gaming'],
      dapp_count: 78,
      is_active: true,
      created_at: '2024-06-01T15:10:00Z',
      updated_at: '2024-06-23T14:45:00Z'
    }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  // Listen for dashboard quick action to open create modal
  useEffect(() => {
    const handleOpenCreateCategory = () => {
      setShowCreateForm(true);
    };

    window.addEventListener('openCreateCategory', handleOpenCreateCategory);
    return () => {
      window.removeEventListener('openCreateCategory', handleOpenCreateCategory);
    };
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setCategories(mockCategories);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories.map(cat => cat.id)));
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = generateSlug(formData.title);
      const categoryData = {
        ...formData,
        slug
      };

      if (editingCategory) {
        // Update existing category
        console.log('Updating category:', categoryData);
      } else {
        // Create new category
        console.log('Creating category:', categoryData);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        icon_name: 'Folder',
        color_gradient: 'from-blue-500 to-cyan-600',
        sub_categories: [],
        is_active: true
      });
      setShowCreateForm(false);
      setEditingCategory(null);
      
      // Reload categories
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      title: category.title,
      description: category.description,
      icon_name: category.icon_name,
      color_gradient: category.color_gradient,
      sub_categories: [...category.sub_categories],
      is_active: category.is_active || true
    });
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        console.log('Deleting category:', categoryId);
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const toggleActive = async (categoryId: string) => {
    try {
      console.log('Toggling active status for category:', categoryId);
      loadCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    }
  };

  const addSubCategory = () => {
    setFormData(prev => ({
      ...prev,
      sub_categories: [...prev.sub_categories, '']
    }));
  };

  const removeSubCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sub_categories: prev.sub_categories.filter((_, i) => i !== index)
    }));
  };

  const updateSubCategory = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      sub_categories: prev.sub_categories.map((subCat, i) => 
        i === index ? value : subCat
      )
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.sub_categories.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPopularityLevel = (count: number) => {
    if (count > 100) return { level: 'high', color: 'text-green-400', label: 'High' };
    if (count > 50) return { level: 'medium', color: 'text-yellow-400', label: 'Medium' };
    return { level: 'low', color: 'text-gray-400', label: 'Low' };
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Categories Management</h1>
            <p className="text-gray-400">
              Organize and manage dApp categories and their hierarchical structure
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories, descriptions, or sub-categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center px-4 py-3 bg-gray-700 border border-gray-600 hover:bg-gray-600 text-white rounded-lg transition-colors">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedCategories.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-purple-300 font-medium">
                    {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      Activate
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                      Deactivate
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategories(new Set())}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-700/50 border-b border-gray-600 px-6 py-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.size === categories.length && categories.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-300">
                    <div className="col-span-4">Category</div>
                    <div className="col-span-2">Sub-categories</div>
                    <div className="col-span-2">dApps</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2">Last Updated</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="divide-y divide-gray-700/50">
                {filteredCategories.map((category, index) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const popularity = getPopularityLevel(category.dapp_count || 0);
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-700/30 transition-colors group"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(category.id)}
                            onChange={() => handleSelectCategory(category.id)}
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                          />
                          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                            {/* Category Info */}
                            <div className="col-span-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleExpanded(category.id)}
                                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                                <div className={`w-10 h-10 bg-gradient-to-br ${category.color_gradient} rounded-lg flex items-center justify-center`}>
                                  <span className="text-white text-sm">📁</span>
                                </div>
                                <div>
                                  <h3 className="font-medium text-white">{category.title}</h3>
                                  <p className="text-sm text-gray-400 truncate max-w-xs">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Sub-categories */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-1">
                                <span className="text-white font-medium">{category.sub_categories.length}</span>
                                <span className="text-gray-400 text-sm">sub-categories</span>
                              </div>
                            </div>

                            {/* dApp Count */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{category.dapp_count}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  popularity.level === 'high' ? 'bg-green-600/20 text-green-300' :
                                  popularity.level === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                                  'bg-gray-600/20 text-gray-400'
                                }`}>
                                  {popularity.label}
                                </span>
                              </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                              <button
                                onClick={() => toggleActive(category.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  category.is_active
                                    ? 'bg-green-600/20 text-green-300 hover:bg-green-600/30'
                                    : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                                }`}
                              >
                                {category.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                {category.is_active ? 'Active' : 'Inactive'}
                              </button>
                            </div>

                            {/* Last Updated */}
                            <div className="col-span-2">
                              <span className="text-gray-400 text-sm">
                                {new Date(category.updated_at).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                <button
                                  onClick={() => handleEdit(category)}
                                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                                  title="Duplicate"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(category.id)}
                                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-600/20 rounded-lg transition-colors">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Sub-categories */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 ml-12 pl-4 border-l-2 border-gray-600"
                            >
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {category.sub_categories.map((subCategory, subIndex) => (
                                  <div
                                    key={subIndex}
                                    className="px-3 py-2 bg-gray-700/50 rounded-lg border border-gray-600"
                                  >
                                    <span className="text-sm text-gray-300">{subCategory}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Create/Edit Category Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowCreateForm(false);
                setEditingCategory(null);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCategory(null);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter category title"
                      required
                    />
                    {formData.title && (
                      <p className="mt-1 text-sm text-gray-400">
                        Slug: {generateSlug(formData.title)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Describe what this category contains"
                      required
                    />
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Icon
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {availableIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon_name: icon }))}
                          className={`p-3 rounded-lg border transition-colors ${
                            formData.icon_name === icon
                              ? 'border-purple-500 bg-purple-600/20'
                              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <span className="text-lg">📁</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Gradient */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableGradients.map((gradient) => (
                        <button
                          key={gradient.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color_gradient: gradient.value }))}
                          className={`p-3 rounded-lg border transition-colors ${
                            formData.color_gradient === gradient.value
                              ? 'border-purple-500'
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-full h-8 bg-gradient-to-r ${gradient.value} rounded mb-2`} />
                          <span className="text-sm text-gray-300">{gradient.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sub-categories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Sub-categories
                      </label>
                      <button
                        type="button"
                        onClick={addSubCategory}
                        className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.sub_categories.map((subCategory, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={subCategory}
                            onChange={(e) => updateSubCategory(index, e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                            placeholder="Enter sub-category name"
                            autoFocus={subCategory === ''}
                          />
                          <button
                            type="button"
                            onClick={() => removeSubCategory(index)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded transition-colors"
                            title="Remove sub-category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Show message when no sub-categories */}
                      {formData.sub_categories.length === 0 && (
                        <div className="text-center py-4 border-2 border-dashed border-gray-600 rounded-lg">
                          <p className="text-gray-400 text-sm">No sub-categories added yet</p>
                          <p className="text-gray-500 text-xs mt-1">Click "Add" to create your first sub-category</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-white">Active Status</label>
                      <p className="text-xs text-gray-400">Category will be visible on the public site</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.is_active ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    <button
                      type="submit"
                      className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCategory(null);
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoriesManagement;