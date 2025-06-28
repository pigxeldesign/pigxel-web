import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Eye, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Calendar,
  Link as LinkIcon,
  Tag,
  Globe,
  Github,
  Twitter,
  BookOpen,
  MessageCircle,
  Loader2,
  ArrowLeft,
  Copy,
  RotateCcw,
  Clock,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';

interface DAppFormData {
  name: string;
  description: string;
  problem_solved: string;
  logo_url?: string;
  thumbnail_url?: string;
  category_id?: string;
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
}

interface Category {
  id: string;
  slug: string;
  title: string;
  sub_categories: string[];
}

interface ValidationErrors {
  [key: string]: string;
}

const AdminDAppForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState<DAppFormData>({
    name: '',
    description: '',
    problem_solved: '',
    sub_category: '',
    blockchains: [],
    is_new: false,
    is_featured: false,
    live_url: '',
    audits: [],
    licenses: []
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  
  // File upload refs
  
  // Available options
  const blockchainOptions = [
    'Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Avalanche', 
    'Solana', 'Cardano', 'Polkadot', 'Cosmos', 'Near', 'Fantom'
  ];
  
  const licenseOptions = [
    'MIT', 'Apache 2.0', 'GPL v3', 'BSD 3-Clause', 'ISC', 'Mozilla Public License 2.0'
  ];

  // Load categories and dApp data
  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadDAppData();
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && isEditing) {
      const timer = setTimeout(() => {
        autoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, isDirty]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, slug, title, sub_categories')
        .order('title');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadDAppData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dapps')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          problem_solved: data.problem_solved || '',
          logo_url: data.logo_url,
          thumbnail_url: data.thumbnail_url,
          category_id: data.category_id,
          sub_category: data.sub_category || '',
          blockchains: data.blockchains || [],
          rating: data.rating,
          user_count: data.user_count,
          is_new: data.is_new || false,
          is_featured: data.is_featured || false,
          live_url: data.live_url || '',
          github_url: data.github_url,
          twitter_url: data.twitter_url,
          documentation_url: data.documentation_url,
          discord_url: data.discord_url,
          founded: data.founded,
          team: data.team,
          total_value_locked: data.total_value_locked,
          daily_active_users: data.daily_active_users,
          transactions: data.transactions,
          audits: data.audits || [],
          licenses: data.licenses || []
        });
      }
    } catch (error) {
      console.error('Error loading dApp:', error);
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!isEditing || !isDirty) return;
    
    setAutoSaveStatus('saving');
    try {
      await saveDApp(true);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'dApp name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'dApp name must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    if (!formData.problem_solved.trim()) {
      errors.problem_solved = 'Problem solved description is required';
    }
    
    if (!formData.sub_category.trim()) {
      errors.sub_category = 'Sub-category is required';
    }
    
    if (!formData.live_url.trim()) {
      errors.live_url = 'Live URL is required';
    } else if (!isValidUrl(formData.live_url)) {
      errors.live_url = 'Please enter a valid URL';
    }
    
    // Optional URL validations
    if (formData.github_url && !isValidUrl(formData.github_url)) {
      errors.github_url = 'Please enter a valid GitHub URL';
    }
    
    if (formData.twitter_url && !isValidUrl(formData.twitter_url)) {
      errors.twitter_url = 'Please enter a valid Twitter URL';
    }
    
    if (formData.documentation_url && !isValidUrl(formData.documentation_url)) {
      errors.documentation_url = 'Please enter a valid documentation URL';
    }
    
    if (formData.discord_url && !isValidUrl(formData.discord_url)) {
      errors.discord_url = 'Please enter a valid Discord URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof DAppFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };


  const saveDApp = async (isAutoSave = false) => {
    if (!isAutoSave && !validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const dataToSave = { ...formData };
      
      if (isEditing) {
        const { error } = await supabase
          .from('dapps')
          .update(dataToSave)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dapps')
          .insert([dataToSave]);
        
        if (error) throw error;
      }
      
      if (!isAutoSave) {
        setIsDirty(false);
        navigate('/admin/dapps');
      }
    } catch (error) {
      console.error('Error saving dApp:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
  const availableSubCategories = selectedCategory?.sub_categories || [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading dApp data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dapps')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isEditing ? 'Edit dApp' : 'Create New dApp'}
              </h1>
              <p className="text-gray-400">
                {isEditing ? 'Update dApp information and settings' : 'Add a new decentralized application to the directory'}
              </p>
            </div>
          </div>
          
          {/* Auto-save status */}
          {autoSaveStatus && (
            <div className="flex items-center gap-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-blue-400">Saving...</span>
                </>
              )}
              {autoSaveStatus === 'saved' && (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Auto-saved</span>
                </>
              )}
              {autoSaveStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Save failed</span>
                </>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button
              onClick={() => saveDApp()}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update dApp' : 'Create dApp'}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                {/* dApp Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    dApp Name *
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.name.length}/100)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter dApp name"
                    maxLength={100}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.description.length}/500)
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Describe what this dApp does and its key features"
                    maxLength={500}
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                {/* Problem Solved */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Problem Solved *
                    <span className="text-xs text-gray-500 ml-1">
                      <Info className="w-3 h-3 inline" /> What user problem does this dApp address?
                    </span>
                  </label>
                  <textarea
                    value={formData.problem_solved}
                    onChange={(e) => handleInputChange('problem_solved', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${
                      validationErrors.problem_solved ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Explain the specific problem this dApp solves for users"
                  />
                  {validationErrors.problem_solved && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.problem_solved}
                    </p>
                  )}
                </div>

                {/* Live URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Live dApp URL *
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.live_url}
                      onChange={(e) => handleInputChange('live_url', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.live_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://app.example.com"
                    />
                  </div>
                  {validationErrors.live_url && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.live_url}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Media Assets</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Logo URL
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.logo_url || ''}
                      onChange={(e) => handleInputChange('logo_url', e.target.value || undefined)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      placeholder="https://example.com/logo.png"
                    />
                    {formData.logo_url && (
                      <div className="relative">
                        <img
                          src={formData.logo_url}
                          alt="Logo preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-600"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.thumbnail_url || ''}
                      onChange={(e) => handleInputChange('thumbnail_url', e.target.value || undefined)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    {formData.thumbnail_url && (
                      <div className="relative">
                        <img
                          src={formData.thumbnail_url}
                          alt="Thumbnail preview"
                          className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Categorization */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Categorization</h2>
              
              <div className="space-y-6">
                {/* Primary Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Category
                  </label>
                  <select
                    value={formData.category_id || ''}
                    onChange={(e) => handleInputChange('category_id', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sub-category *
                  </label>
                  <select
                    value={formData.sub_category}
                    onChange={(e) => handleInputChange('sub_category', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      validationErrors.sub_category ? 'border-red-500' : 'border-gray-600'
                    }`}
                    disabled={!selectedCategory}
                  >
                    <option value="">Select a sub-category</option>
                    {availableSubCategories.map((subCat) => (
                      <option key={subCat} value={subCat}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                  {validationErrors.sub_category && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.sub_category}
                    </p>
                  )}
                </div>

                {/* Blockchains */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Supported Blockchains
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {blockchainOptions.map((blockchain) => (
                      <label
                        key={blockchain}
                        className="flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.blockchains.includes(blockchain)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('blockchains', [...formData.blockchains, blockchain]);
                            } else {
                              handleInputChange('blockchains', formData.blockchains.filter(b => b !== blockchain));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-white">{blockchain}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Social Links & Resources</h2>
              
              <div className="space-y-4">
                {/* GitHub */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub Repository
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.github_url || ''}
                      onChange={(e) => handleInputChange('github_url', e.target.value || undefined)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.github_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                  {validationErrors.github_url && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.github_url}
                    </p>
                  )}
                </div>

                {/* Twitter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter/X Profile
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.twitter_url || ''}
                      onChange={(e) => handleInputChange('twitter_url', e.target.value || undefined)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.twitter_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  {validationErrors.twitter_url && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.twitter_url}
                    </p>
                  )}
                </div>

                {/* Documentation */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Documentation
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.documentation_url || ''}
                      onChange={(e) => handleInputChange('documentation_url', e.target.value || undefined)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.documentation_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://docs.example.com"
                    />
                  </div>
                  {validationErrors.documentation_url && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.documentation_url}
                    </p>
                  )}
                </div>

                {/* Discord */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Discord Server
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.discord_url || ''}
                      onChange={(e) => handleInputChange('discord_url', e.target.value || undefined)}
                      className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.discord_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://discord.gg/invite"
                    />
                  </div>
                  {validationErrors.discord_url && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.discord_url}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    value={formData.founded || ''}
                    onChange={(e) => handleInputChange('founded', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User Count
                  </label>
                  <input
                    type="text"
                    value={formData.user_count || ''}
                    onChange={(e) => handleInputChange('user_count', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="1M+"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Value Locked
                  </label>
                  <input
                    type="text"
                    value={formData.total_value_locked || ''}
                    onChange={(e) => handleInputChange('total_value_locked', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="$100M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Active Users
                  </label>
                  <input
                    type="text"
                    value={formData.daily_active_users || ''}
                    onChange={(e) => handleInputChange('daily_active_users', e.target.value || undefined)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="50K"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Information
                </label>
                <textarea
                  value={formData.team || ''}
                  onChange={(e) => handleInputChange('team', e.target.value || undefined)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Information about the team behind this dApp"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Controls */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Status & Visibility</h3>
              
              <div className="space-y-4">
                {/* Featured Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Featured</label>
                    <p className="text-xs text-gray-400">Show in featured section</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('is_featured', !formData.is_featured)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_featured ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_featured ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* New Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">New</label>
                    <p className="text-xs text-gray-400">Mark as new dApp</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('is_new', !formData.is_new)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_new ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_new ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="bg-red-600/20 border border-red-600/30 rounded-xl p-4">
                <h3 className="text-sm font-bold text-red-300 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Validation Errors
                </h3>
                <ul className="space-y-1">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="text-xs text-red-300">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Form Progress */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3">Form Completion</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Required fields</span>
                  <span className="text-white">
                    {Object.keys(validationErrors).length === 0 ? '✓' : `${Object.keys(validationErrors).length} errors`}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(0, 100 - (Object.keys(validationErrors).length * 20))}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDAppForm;