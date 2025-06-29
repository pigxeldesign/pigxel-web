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
import { supabase, isValidSafeUrl, isProduction } from '../lib/supabase';

interface DAppFormData {
  name: string;
  description: string;
  problem_solved: string;
  logo_url: string;
  thumbnail_url: string;
  category_id: string;
  sub_category: string;
  blockchains: string[];
  is_new: boolean;
  is_featured: boolean;
  live_url: string;
  github_url: string;
  twitter_url: string;
  documentation_url: string;
  discord_url: string;
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
  const navigationAttempted = useRef(false);
  const saveAttempts = useRef(0);
  const isEditing = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState<DAppFormData>({
    name: '',
    description: '',
    problem_solved: '',
    logo_url: '',
    thumbnail_url: '',
    category_id: '',
    sub_category: '',
    blockchains: [],
    is_new: false,
    is_featured: false,
    live_url: '',
    github_url: '',
    twitter_url: '',
    documentation_url: '',
    discord_url: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // Available options
  const blockchainOptions = [
    'Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Avalanche', 
    'Solana', 'Cardano', 'Polkadot', 'Cosmos', 'Near', 'Fantom'
  ];

  // Log function that also adds to debug logs
  const logDebug = (message: string, obj?: any) => {
    const timestamp = new Date().toISOString().substring(11, 23);
    const logMsg = `${timestamp} - ${message}${obj ? ': ' + JSON.stringify(obj) : ''}`;
    
    console.log(message, obj);
    
    setDebugLogs(prev => {
      const newLogs = [logMsg, ...prev];
      // Keep only the 20 most recent logs
      return newLogs.slice(0, 20);
    });
  };

  // Load categories and dApp data
  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadDAppData();
    }
  }, [id]);

  // Auto-save functionality for editing only
  useEffect(() => {
    if (isDirty && isEditing) {
      const timer = setTimeout(() => {
        autoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, isDirty, isEditing]);

  const loadCategories = async () => {
    try {
      logDebug('Loading categories...');
      const { data, error } = await supabase
        .from('categories')
        .select('id, slug, title, sub_categories')
        .order('title');
      
      if (error) {
        logDebug('Error loading categories', error);
        throw error;
      }
      
      logDebug('Categories loaded successfully', { count: data?.length || 0 });
      setCategories(data || []);
    } catch (error: any) {
      logDebug('Failed to load categories', error);
      setError('Failed to load categories. Please try again.');
    }
  };

  const loadDAppData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      logDebug('Loading dApp data for ID', id);
      const { data, error } = await supabase
        .from('dapps')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logDebug('Error loading dApp data', error);
        throw error;
      }
      
      if (data) {
        logDebug('dApp data loaded successfully', data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          problem_solved: data.problem_solved || '',
          logo_url: data.logo_url || '',
          thumbnail_url: data.thumbnail_url || '',
          category_id: data.category_id || '',
          sub_category: data.sub_category || '',
          blockchains: Array.isArray(data.blockchains) ? data.blockchains : [],
          is_new: !!data.is_new,
          is_featured: !!data.is_featured,
          live_url: data.live_url || '',
          github_url: data.github_url || '',
          twitter_url: data.twitter_url || '',
          documentation_url: data.documentation_url || '',
          discord_url: data.discord_url || ''
        });
      } else {
        logDebug('No dApp data found for ID', id);
        setError('dApp not found');
      }
    } catch (error) {
      logDebug('Failed to load dApp data', error);
      setError('Failed to load dApp data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!isEditing || !isDirty) return;
    
    setAutoSaveStatus('saving');
    try {
      await saveDApp(true);
      logDebug('Auto-save successful');
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
      return true;
    } catch (error) {
      logDebug('Auto-save failed', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 3000);
      return false;
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
    
    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }
    
    if (!formData.sub_category.trim()) {
      errors.sub_category = 'Sub-category is required';
    }
    
    if (!formData.live_url.trim()) {
      errors.live_url = 'Live URL is required';
    } else if (!isValidUrl(formData.live_url)) {
      errors.live_url = 'Please enter a valid URL (must start with http:// or https://)';
    } else if (!isValidSafeUrl(formData.live_url)) {
      errors.live_url = 'URL must use http or https protocol';
    }
    
    // Optional URL validations
    if (formData.github_url && !isValidUrl(formData.github_url)) {
      errors.github_url = 'Please enter a valid GitHub URL (must start with http:// or https://)';
    } else if (formData.github_url && !isValidSafeUrl(formData.github_url)) {
      errors.github_url = 'URL must use http or https protocol';
    }
    
    if (formData.twitter_url && !isValidUrl(formData.twitter_url)) {
      errors.twitter_url = 'Please enter a valid Twitter URL (must start with http:// or https://)';
    } else if (formData.twitter_url && !isValidSafeUrl(formData.twitter_url)) {
      errors.twitter_url = 'URL must use http or https protocol';
    }
    
    if (formData.documentation_url && !isValidUrl(formData.documentation_url)) {
      errors.documentation_url = 'Please enter a valid documentation URL (must start with http:// or https://)';
    } else if (formData.documentation_url && !isValidSafeUrl(formData.documentation_url)) {
      errors.documentation_url = 'URL must use http or https protocol';
    }
    
    if (formData.discord_url && !isValidUrl(formData.discord_url)) {
      errors.discord_url = 'Please enter a valid Discord URL (must start with http:// or https://)';
    } else if (formData.discord_url && !isValidSafeUrl(formData.discord_url)) {
      errors.discord_url = 'URL must use http or https protocol';
    }
    
    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      errors.logo_url = 'Please enter a valid logo URL (must start with http:// or https://)';
    } else if (formData.logo_url && !isValidSafeUrl(formData.logo_url)) {
      errors.logo_url = 'URL must use http or https protocol';
    }
    
    if (formData.thumbnail_url && !isValidUrl(formData.thumbnail_url)) {
      errors.thumbnail_url = 'Please enter a valid thumbnail URL (must start with http:// or https://)';
    } else if (formData.thumbnail_url && !isValidSafeUrl(formData.thumbnail_url)) {
      errors.thumbnail_url = 'URL must use http or https protocol';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logDebug("Form submitted manually");
    saveDApp();
  };

  const saveDApp = async (isAutoSave = false) => {
    // Step 1: Validate form
    logDebug('Step 1: Validating form');
    
    if (!isAutoSave && !validateForm()) {
      logDebug('Validation failed', validationErrors);
      return;
    }
    
    // Step 2: Prepare UI for saving
    logDebug('Step 2: Preparing UI for saving');
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    saveAttempts.current++;
    
    try {
      // Step 3: Prepare data
      logDebug('Step 3: Preparing data for save operation');
      
      const dataToSave = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        problem_solved: formData.problem_solved.trim(),
        logo_url: formData.logo_url.trim() || null,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        category_id: formData.category_id || null,
        sub_category: formData.sub_category ? formData.sub_category.trim() : '',
        blockchains: Array.isArray(formData.blockchains) ? formData.blockchains : [],
        is_new: formData.is_new,
        is_featured: formData.is_featured,
        live_url: formData.live_url.trim(),
        github_url: formData.github_url.trim() || null,
        twitter_url: formData.twitter_url.trim() || null,
        documentation_url: formData.documentation_url.trim() || null,
        discord_url: formData.discord_url.trim() || null
      };

      // Log the complete data being saved
      logDebug('Data to save', dataToSave);
      
      let result;
      
      // Step 4: Save to Supabase
      logDebug('Step 4: Saving to Supabase database');
      
      if (isEditing) {
        logDebug('Updating dApp with ID:', id);
        
        // First try using the admin RPC function if available
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'admin_save_dapp',
            {
              p_dapp_data: { ...dataToSave, id },
              p_operation: 'UPDATE'
            }
          );
          
          if (rpcError) {
            logDebug('RPC update failed, falling back to regular update', rpcError);
            // Fall back to regular update
          } else {
            logDebug('RPC update successful', rpcData);
            result = rpcData;
            
            // Skip the regular update
            throw new Error('SKIP_REGULAR_UPDATE');
          }
        } catch (rpcErr) {
          if (rpcErr instanceof Error && rpcErr.message === 'SKIP_REGULAR_UPDATE') {
            // This is our signal to skip the regular update
            logDebug('Skipping regular update after successful RPC call');
          } else {
            // For any other error, continue with regular update
            logDebug('Falling back to regular update after RPC error', rpcErr);
            
            // Regular update
            const { data, error } = await supabase
              .from('dapps')
              .update({ ...dataToSave, updated_at: new Date().toISOString() })
              .eq('id', id)
              .select();
              
            logDebug('Regular update response', { data, error });
            
            if (error) {
              throw new Error(`Update failed: ${error.message}`);
            }
            
            result = { success: true, operation: 'UPDATE', data };
            logDebug('dApp updated successfully');
          }
        }
      } else {
        logDebug('Creating new dApp');
        
        // First try using the admin RPC function if available
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'admin_save_dapp',
            {
              p_dapp_data: dataToSave,
              p_operation: 'INSERT'
            }
          );
          
          if (rpcError) {
            logDebug('RPC insert failed, falling back to regular insert', rpcError);
            // Fall back to regular insert
          } else {
            logDebug('RPC insert successful', rpcData);
            result = rpcData;
            
            // Skip the regular insert
            throw new Error('SKIP_REGULAR_INSERT');
          }
        } catch (rpcErr) {
          if (rpcErr instanceof Error && rpcErr.message === 'SKIP_REGULAR_INSERT') {
            // This is our signal to skip the regular insert
            logDebug('Skipping regular insert after successful RPC call');
          } else {
            // For any other error, continue with regular insert
            logDebug('Falling back to regular insert after RPC error', rpcErr);
            
            // Regular insert
            const { data, error } = await supabase
              .from('dapps')
              .insert([dataToSave])
              .select();
              
            logDebug('Regular insert response', { data, error });
            
            if (error) {
              throw new Error(`Insert failed: ${error.message}`);
            }
            
            result = { success: true, operation: 'INSERT', data };
            logDebug('dApp created successfully', data?.[0]?.id || 'No ID returned');
          }
        }
      }
      
      // Step 5: Handle success
      logDebug('Step 5: Save operation successful', result);
      
      if (!isAutoSave) {
        setIsDirty(false);
        setSaveSuccess(true);
        
        if (!navigationAttempted.current) {
          navigationAttempted.current = true;
          
          logDebug('Scheduling navigation to /admin/dapps in 2 seconds');
          setTimeout(() => {
            logDebug('Attempting to navigate to /admin/dapps now');
            
            try {
              navigate('/admin/dapps');
              logDebug('Navigation successful');
            } catch (navError) {
              logDebug('Navigation error, trying window.location.href fallback', navError);
              // In case of a navigation error, try a different approach
              window.location.href = '/admin/dapps';
            }
          }, 2000);
        }
      } else {
        // For auto-save, just mark as saved
        logDebug('Auto-save successful');
      }
    } catch (error: any) {
      // Step 6: Handle errors
      logDebug('Save operation failed', error);
      
      setError(typeof error === 'string' ? error : 
               error.message || 'Failed to save dApp. Please try again.');
    } finally {
      // Step 7: Clean up
      logDebug('Step 7: Cleanup - setting saving state to false');
      
      // Set saving to false to update UI
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
              onClick={handleSubmit}
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

        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-600/20 border border-green-600/30 rounded-lg flex items-center"
          >
            <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
            <p className="text-green-300 text-sm">
              {isEditing ? 'dApp updated successfully!' : 'dApp created successfully!'}
            </p>
            <button
              onClick={() => setSaveSuccess(false)}
              className="ml-auto text-green-400 hover:text-green-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
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
            </form>

            {/* Media Assets */}
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
                      value={formData.logo_url}
                      onChange={(e) => handleInputChange('logo_url', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.logo_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://example.com/logo.png"
                    />
                    {validationErrors.logo_url && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.logo_url}</p>
                    )}
                    {formData.logo_url && (
                      <div className="mt-2">
                        <img
                          src={isValidSafeUrl(formData.logo_url) ? formData.logo_url : ''}
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
                      value={formData.thumbnail_url}
                      onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.thumbnail_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    {validationErrors.thumbnail_url && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.thumbnail_url}</p>
                    )}
                    {formData.thumbnail_url && (
                      <div className="mt-2">
                        <img
                          src={isValidSafeUrl(formData.thumbnail_url) ? formData.thumbnail_url : ''}
                          alt="Thumbnail preview"
                          className="w-full h-24 object-cover rounded border border-gray-600"
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
                    Primary Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      handleInputChange('category_id', e.target.value);
                      // Reset sub-category when category changes
                      handleInputChange('sub_category', '');
                    }}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      validationErrors.category_id ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category_id && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.category_id}
                    </p>
                  )}
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
                  {!selectedCategory && (
                    <p className="mt-1 text-sm text-gray-400">
                      Please select a category first
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
                      value={formData.github_url}
                      onChange={(e) => handleInputChange('github_url', e.target.value)}
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
                      value={formData.twitter_url}
                      onChange={(e) => handleInputChange('twitter_url', e.target.value)}
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
                      value={formData.documentation_url}
                      onChange={(e) => handleInputChange('documentation_url', e.target.value)}
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
                      value={formData.discord_url}
                      onChange={(e) => handleInputChange('discord_url', e.target.value)}
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

            {/* Debug Info (only during development) */}
            {!isProduction() && (
              <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-red-300 mb-2">Debug Information</h3>
                <div className="space-y-1 text-xs text-red-400">
                  <div>Saving: {saving ? 'true' : 'false'}</div>
                  <div>Is Dirty: {isDirty ? 'true' : 'false'}</div>
                  <div>Navigation Attempted: {navigationAttempted.current ? 'true' : 'false'}</div>
                  <div>Save Attempts: {saveAttempts.current}</div>
                  <div>Validation Errors: {Object.keys(validationErrors).length}</div>
                </div>

                {/* Debug logs */}
                {debugLogs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-700/30">
                    <h4 className="text-xs font-semibold text-red-300 mb-1">Recent Logs:</h4>
                    <div className="max-h-40 overflow-y-auto">
                      {debugLogs.map((log, i) => (
                        <div key={i} className="text-xs text-red-400 whitespace-pre-wrap">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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