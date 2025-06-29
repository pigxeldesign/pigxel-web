import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Trash2,
  Search,
  Image as ImageIcon,
  Move
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';

interface DApp {
  id: string;
  name: string;
  category: {
    title: string;
  };
  sub_category: string;
  logo_url?: string;
}

interface FlowFormData {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  is_premium: boolean;
  dapp_id: string;
}

interface FlowScreenFormData {
  id?: string;
  thumbnail_url: string;
  title: string;
  description: string;
  order_index: number;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function AdminFlowForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FlowFormData>({
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    is_premium: false,
    dapp_id: ''
  });

  const [flowScreens, setFlowScreens] = useState<FlowScreenFormData[]>([]);
  const [dapps, setDapps] = useState<DApp[]>([]);
  const [dappSearchTerm, setDappSearchTerm] = useState('');
  const [showDappDropdown, setShowDappDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [error, setError] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  useEffect(() => {
    fetchDApps();
    if (isEditing) {
      fetchFlow();
    }
  }, [id, isEditing]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && isEditing) {
      const timer = setTimeout(() => {
        autoSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [formData, flowScreens, isDirty]);

  const fetchDApps = async () => {
    try {
      const { data, error } = await supabase
        .from('dapps')
        .select(`
          id,
          name,
          sub_category,
          logo_url,
          categories!inner(title)
        `)
        .order('name');

      if (error) throw error;

      const formattedDapps = data.map(dapp => ({
        id: dapp.id,
        name: dapp.name,
        sub_category: dapp.sub_category,
        logo_url: dapp.logo_url,
        category: {
          title: dapp.categories.title
        }
      }));

      setDapps(formattedDapps);
    } catch (error) {
      console.error('Error fetching dApps:', error);
      setError('Failed to load dApps');
    }
  };

  const fetchFlow = async () => {
    try {
      setLoading(true);
      const { data: flowData, error: flowError } = await supabase
        .from('flows')
        .select('*')
        .eq('id', id)
        .single();

      if (flowError) throw flowError;

      setFormData({
        title: flowData.title,
        description: flowData.description,
        duration: flowData.duration,
        difficulty: flowData.difficulty,
        is_premium: flowData.is_premium,
        dapp_id: flowData.dapp_id
      });

      // Set the search term to the selected dApp name
      const selectedDapp = dapps.find(dapp => dapp.id === flowData.dapp_id);
      if (selectedDapp) {
        setDappSearchTerm(selectedDapp.name);
      }

      // Fetch flow screens
      const { data: screensData, error: screensError } = await supabase
        .from('flow_screens')
        .select('*')
        .eq('flow_id', id)
        .order('order_index');

      if (screensError) throw screensError;

      const formattedScreens = screensData.map(screen => ({
        id: screen.id,
        thumbnail_url: screen.thumbnail_url,
        title: screen.title,
        description: screen.description || '',
        order_index: screen.order_index
      }));

      setFlowScreens(formattedScreens);
    } catch (error) {
      console.error('Error fetching flow:', error);
      setError('Failed to load flow');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Required fields
    if (!formData.title.trim()) {
      errors.title = 'Flow title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required';
    }
    
    if (!formData.dapp_id) {
      errors.dapp_id = 'dApp selection is required';
    }

    // Validate flow screens
    flowScreens.forEach((screen, index) => {
      if (!screen.title.trim()) {
        errors[`screen_${index}_title`] = `Screen ${index + 1} title is required`;
      }
      if (!screen.thumbnail_url.trim()) {
        errors[`screen_${index}_thumbnail`] = `Screen ${index + 1} thumbnail URL is required`;
      } else if (!isValidUrl(screen.thumbnail_url)) {
        errors[`screen_${index}_thumbnail`] = `Screen ${index + 1} thumbnail URL is invalid`;
      }
    });
    
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

  const handleInputChange = (field: keyof FlowFormData, value: any) => {
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

  const autoSave = async () => {
    if (!isEditing || !isDirty) return;
    
    setAutoSaveStatus('saving');
    try {
      await saveFlow(true);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await saveFlow();
  };

  const saveFlow = async (isAutoSave = false) => {
    if (!isAutoSave && !validateForm()) {
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      let flowId = id;
      
      if (isEditing) {
        const { error } = await supabase
          .from('flows')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('flows')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        flowId = data.id;
      }

      // Save flow screens
      if (flowScreens.length > 0) {
        // Delete existing screens if editing
        if (isEditing) {
          const { error: deleteError } = await supabase
            .from('flow_screens')
            .delete()
            .eq('flow_id', flowId);

          if (deleteError) throw deleteError;
        }

        // Insert new screens
        const screensToInsert = flowScreens.map((screen, index) => ({
          flow_id: flowId,
          order_index: index,
          thumbnail_url: screen.thumbnail_url,
          title: screen.title,
          description: screen.description
        }));

        const { error: screensError } = await supabase
          .from('flow_screens')
          .insert(screensToInsert);

        if (screensError) throw screensError;
      }

      if (!isAutoSave) {
        setIsDirty(false);
        navigate('/admin/flows');
      }
    } catch (error: any) {
      console.error('Error saving flow:', error);
      setError(error.message || 'Failed to save flow. Please try again.');
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleDappSelect = (dapp: DApp) => {
    handleInputChange('dapp_id', dapp.id);
    setDappSearchTerm(dapp.name);
    setShowDappDropdown(false);
  };

  const addScreen = () => {
    const newScreen: FlowScreenFormData = {
      thumbnail_url: '',
      title: '',
      description: '',
      order_index: flowScreens.length
    };
    setFlowScreens(prev => [...prev, newScreen]);
    setIsDirty(true);
  };

  const removeScreen = (index: number) => {
    setFlowScreens(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const updateScreen = (index: number, field: keyof FlowScreenFormData, value: string) => {
    setFlowScreens(prev => prev.map((screen, i) => 
      i === index ? { ...screen, [field]: value } : screen
    ));
    setIsDirty(true);
    
    // Clear validation error for this field
    const errorKey = `screen_${index}_${field === 'thumbnail_url' ? 'thumbnail' : field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const moveScreen = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= flowScreens.length) return;
    
    setFlowScreens(prev => {
      const newScreens = [...prev];
      const [movedScreen] = newScreens.splice(fromIndex, 1);
      newScreens.splice(toIndex, 0, movedScreen);
      return newScreens.map((screen, index) => ({ ...screen, order_index: index }));
    });
    setIsDirty(true);
  };

  const filteredDapps = dapps.filter(dapp =>
    dapp.name.toLowerCase().includes(dappSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading flow data...</p>
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
              onClick={() => navigate('/admin/flows')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isEditing ? 'Edit Flow' : 'Create New Flow'}
              </h1>
              <p className="text-gray-400">
                {isEditing ? 'Update flow information and screens' : 'Create a new user flow with step-by-step screens'}
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
              onClick={() => saveFlow()}
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
                  {isEditing ? 'Update Flow' : 'Create Flow'}
                </>
              )}
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
              onClick={() => setError('')}
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
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Flow Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flow Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      validationErrors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter flow title"
                    required
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors resize-none ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Describe what this flow teaches and its key steps"
                    required
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., 5 minutes"
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.duration ? 'border-red-500' : 'border-gray-600'
                      }`}
                      required
                    />
                    {validationErrors.duration && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.duration}
                      </p>
                    )}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* dApp Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    dApp *
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={dappSearchTerm}
                        onChange={(e) => {
                          setDappSearchTerm(e.target.value);
                          setShowDappDropdown(true);
                        }}
                        onFocus={() => setShowDappDropdown(true)}
                        placeholder="Search for a dApp..."
                        className={`w-full pl-10 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                          validationErrors.dapp_id ? 'border-red-500' : 'border-gray-600'
                        }`}
                        required
                      />
                    </div>

                    {showDappDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredDapps.length > 0 ? (
                          <div className="py-1">
                            {filteredDapps.map((dapp) => (
                              <button
                                key={dapp.id}
                                type="button"
                                onClick={() => handleDappSelect(dapp)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm">
                                  {dapp.logo_url ? (
                                    <img src={dapp.logo_url} alt={dapp.name} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    '📱'
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium">{dapp.name}</div>
                                  <div className="text-sm text-gray-400">
                                    {dapp.category.title} • {dapp.sub_category}
                                  </div>
                                </div>
                                {formData.dapp_id === dapp.id && (
                                  <Check className="w-4 h-4 text-purple-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-3 text-gray-400 text-center">
                            {dappSearchTerm ? 'No dApps found' : 'Start typing to search...'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {validationErrors.dapp_id && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.dapp_id}
                    </p>
                  )}
                </div>

                {/* Premium Flow Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_premium"
                    checked={formData.is_premium}
                    onChange={(e) => handleInputChange('is_premium', e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="is_premium" className="text-sm font-medium text-gray-300">
                    Premium Flow
                    <span className="text-xs text-gray-500 ml-2">
                      <Info className="w-3 h-3 inline mr-1" />
                      Requires premium subscription to access
                    </span>
                  </label>
                </div>
              </form>
            </div>

            {/* Flow Screens */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Flow Screens</h2>
                <button
                  type="button"
                  onClick={addScreen}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Screen
                </button>
              </div>

              {flowScreens.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No screens added yet</h3>
                  <p className="text-gray-400 mb-4">Add screens to create a step-by-step flow</p>
                  <button
                    type="button"
                    onClick={addScreen}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add First Screen
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {flowScreens.map((screen, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Screen {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveScreen(index, index - 1)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                              title="Move up"
                            >
                              <Move className="w-4 h-4" />
                            </button>
                          )}
                          {index < flowScreens.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveScreen(index, index + 1)}
                              className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                              title="Move down"
                            >
                              <Move className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeScreen(index)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                            title="Remove screen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Thumbnail URL */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Thumbnail URL *
                          </label>
                          <input
                            type="url"
                            value={screen.thumbnail_url}
                            onChange={(e) => updateScreen(index, 'thumbnail_url', e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                              validationErrors[`screen_${index}_thumbnail`] ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="https://example.com/image.jpg"
                          />
                          {validationErrors[`screen_${index}_thumbnail`] && (
                            <p className="mt-1 text-sm text-red-400">{validationErrors[`screen_${index}_thumbnail`]}</p>
                          )}
                          {screen.thumbnail_url && isValidUrl(screen.thumbnail_url) && (
                            <div className="mt-2">
                              <img
                                src={screen.thumbnail_url}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded border border-gray-600"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Screen Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Screen Title *
                          </label>
                          <input
                            type="text"
                            value={screen.title}
                            onChange={(e) => updateScreen(index, 'title', e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                              validationErrors[`screen_${index}_title`] ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="Enter screen title"
                          />
                          {validationErrors[`screen_${index}_title`] && (
                            <p className="mt-1 text-sm text-red-400">{validationErrors[`screen_${index}_title`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Screen Description */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={screen.description}
                          onChange={(e) => updateScreen(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Describe what happens in this screen"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Controls */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Flow Settings</h3>
              
              <div className="space-y-4">
                {/* Premium Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white">Premium Flow</label>
                    <p className="text-xs text-gray-400">Requires subscription to access</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('is_premium', !formData.is_premium)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_premium ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.is_premium ? 'translate-x-6' : 'translate-x-1'
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
                      width: `${Math.max(0, 100 - (Object.keys(validationErrors).length * 10))}%` 
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Screens added</span>
                  <span className="text-white">{flowScreens.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}