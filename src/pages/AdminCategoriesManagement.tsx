import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Search, Filter, MoreHorizontal, Eye, EyeOff, Copy, Move, Palette, Hash, Loader2, CircleDot as DragHandleDots2, Check, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { supabase, isProduction } from '../lib/supabase';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    try {
      console.log('Loading categories from Supabase...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Categories loaded:', data);
      setCategories(data || []);
    } catch (error) {
      if (!isProduction()) {
        console.error('Error loading categories:', error);
      } else {
        console.error('Error loading categories:', error instanceof Error ? error.message : 'Failed to load categories');
      }
      setError('Failed to load categories. Please try again.');
    } finally {
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon_name: 'Folder',
      color_gradient: 'from-blue-500 to-cyan-600',
      sub_categories: [],
      is_active: true
    });
    setEditingCategory(null);
    setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const slug = generateSlug(formData.title);
      
      // Filter out empty sub-categories
      const cleanSubCategories = formData.sub_categories.filter(sub => sub.trim() !== '');
      
      const categoryData = {
        slug,
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon_name: formData.icon_name,
        color_gradient: formData.color_gradient,
        sub_categories: cleanSubCategories
      };

      if (editingCategory) {
        console.log('Updating category:', categoryData);
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        console.log('Category updated successfully');
      } else {
        console.log('Creating category:', categoryData);
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        console.log('Category created successfully');
      }

      // Reset form and close modal
      resetForm();
      setShowCreateForm(false);
      
      // Reload categories
      await loadCategories();
    } catch (error: any) {
      if (!isProduction()) {
        console.error('Error saving category:', error);
      } else {
        console.error('Error saving category:', error.message || 'Failed to save category');
      }
      setError(error.message || 'Failed to save category. Please try again.');
    } finally {
      setSaving(false);
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
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (window.confirm(`Are you sure you want to delete "${category.title}"? This action cannot be undone.`)) {
      try {
        console.log('Deleting category:', categoryId);
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);

        if (error) throw error;
        
        console.log('Category deleted successfully');
        await loadCategories();
        
        // Remove from selected categories if it was selected
        setSelectedCategories(prev => {
          const newSet = new Set(prev);
          newSet.delete(categoryId);
          return newSet;
        });
      } catch (error: any) {
        if (!isProduction()) {
          console.error('Error deleting category:', error);
        } else {
          console.error('Error deleting category:', error.message || 'Failed to delete category');
        }
        setError(error.message || 'Failed to delete category. Please try again.');
      }
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
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📁</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {categories.length === 0 ? 'No categories yet' : 'No categories found'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {categories.length === 0 
                        ? 'Create your first category to get started organizing dApps.'
                        : 'Try adjusting your search terms to find categories.'
                      }
                    </p>
                    {categories.length === 0 && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Create First Category
                      </button>
                    )}
                  </div>
                ) : (
                  filteredCategories.map((category, index) => {
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
                                  <span className="text-white font-medium">{category.dapp_count || 0}</span>
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
                                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-300">
                                  <Eye className="w-3 h-3" />
                                  Active
                                </span>
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
                  })
                )}
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
                if (!saving) {
                  setShowCreateForm(false);
                  resetForm();
                }
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
                      if (!saving) {
                        setShowCreateForm(false);
                        resetForm();
                      }
                    }}
                    disabled={saving}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
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
                      disabled={saving}
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
                      disabled={saving}
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
                          disabled={saving}
                          className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${
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
                          disabled={saving}
                          className={`p-3 rounded-lg border transition-colors disabled:opacity-50 ${
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
                        disabled={saving}
                        className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors disabled:opacity-50"
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
                            disabled={saving}
                          />
                          <button
                            type="button"
                            onClick={() => removeSubCategory(index)}
                            disabled={saving}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded transition-colors disabled:opacity-50"
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

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    <button
                      type="submit"
                      disabled={saving || !formData.title.trim() || !formData.description.trim()}
                      className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {editingCategory ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {editingCategory ? 'Update Category' : 'Create Category'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!saving) {
                          setShowCreateForm(false);
                          resetForm();
                        }
                      }}
                      disabled={saving}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
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