import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, X, Check, AlertCircle, Info, Clock, Plus, Trash2, ArrowLeft, Loader2, Crown, Play, ChevronUp, ChevronDown, CircleDot as DragHandleDots2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';

interface FlowFormData {
  dapp_id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  is_premium: boolean;
  status: 'draft' | 'published';
  screens: FlowScreen[];
}

interface FlowScreen {
  id: string;
  order_index: number;
  thumbnail_url: string;
  title: string;
  description: string;
}

interface DApp {
  id: string;
  name: string;
  logo: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const AdminFlowForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState<FlowFormData>({
    dapp_id: '',
    title: '',
    description: '',
    duration: '',
    difficulty: 'Beginner',
    is_premium: false,
    status: 'draft',
    screens: []
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dapps, setDApps] = useState<DApp[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [draggedScreen, setDraggedScreen] = useState<number | null>(null);

  // Mock dApps data
  const mockDApps: DApp[] = [
    { id: '1', name: 'Uniswap', logo: '🦄' },
    { id: '2', name: 'MetaMask', logo: '🦊' },
    { id: '3', name: 'OpenSea', logo: '🌊' },
    { id: '4', name: 'Aave', logo: '👻' },
    { id: '5', name: 'Compound', logo: '🏛️' }
  ];

  useEffect(() => {
    loadDApps();
    if (isEditing) {
      loadFlowData();
    }
  }, [id]);

  const loadDApps = async () => {
    try {
      // Simulate API call
      setDApps(mockDApps);
    } catch (error) {
      console.error('Error loading dApps:', error);
    }
  };

  const loadFlowData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const mockFlow = {
          dapp_id: '1',
          title: 'Token Swapping Basics',
          description: 'Learn how to swap tokens on Uniswap with step-by-step guidance',
          duration: '3 min',
          difficulty: 'Beginner' as const,
          is_premium: false,
          status: 'published' as const,
          screens: [
            {
              id: '1',
              order_index: 0,
              thumbnail_url: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
              title: 'Connect Wallet',
              description: 'Start by connecting your Web3 wallet to access Uniswap'
            },
            {
              id: '2',
              order_index: 1,
              thumbnail_url: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
              title: 'Select Tokens',
              description: 'Choose the tokens you want to swap from and to'
            },
            {
              id: '3',
              order_index: 2,
              thumbnail_url: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
              title: 'Enter Amount',
              description: 'Specify the amount you want to trade'
            }
          ]
        };
        setFormData(mockFlow);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading flow:', error);
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.dapp_id) {
      errors.dapp_id = 'Please select a dApp';
    }
    
    if (!formData.title.trim()) {
      errors.title = 'Flow title is required';
    } else if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    if (!formData.duration.trim()) {
      errors.duration = 'Duration is required';
    }
    
    if (formData.screens.length === 0) {
      errors.screens = 'At least one screen is required';
    }
    
    // Validate screens
    formData.screens.forEach((screen, index) => {
      if (!screen.title.trim()) {
        errors[`screen_${index}_title`] = 'Screen title is required';
      }
      if (!screen.thumbnail_url.trim()) {
        errors[`screen_${index}_thumbnail`] = 'Screen thumbnail URL is required';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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

  const addScreen = () => {
    const newScreen: FlowScreen = {
      id: `temp_${Date.now()}`,
      order_index: formData.screens.length,
      thumbnail_url: '',
      title: '',
      description: ''
    };
    
    setFormData(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen]
    }));
    setIsDirty(true);
  };

  const removeScreen = (index: number) => {
    setFormData(prev => ({
      ...prev,
      screens: prev.screens.filter((_, i) => i !== index).map((screen, i) => ({
        ...screen,
        order_index: i
      }))
    }));
    setIsDirty(true);
  };

  const updateScreen = (index: number, field: keyof FlowScreen, value: string) => {
    setFormData(prev => ({
      ...prev,
      screens: prev.screens.map((screen, i) => 
        i === index ? { ...screen, [field]: value } : screen
      )
    }));
    setIsDirty(true);
    
    // Clear validation errors for this screen field
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
    if (toIndex < 0 || toIndex >= formData.screens.length) return;
    
    const newScreens = [...formData.screens];
    const [movedScreen] = newScreens.splice(fromIndex, 1);
    newScreens.splice(toIndex, 0, movedScreen);
    
    // Update order indices
    const updatedScreens = newScreens.map((screen, index) => ({
      ...screen,
      order_index: index
    }));
    
    setFormData(prev => ({ ...prev, screens: updatedScreens }));
    setIsDirty(true);
  };

  const saveFlow = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const flowData = { ...formData };
      
      if (isEditing) {
        console.log('Updating flow:', flowData);
      } else {
        console.log('Creating flow:', flowData);
      }
      
      setIsDirty(false);
      navigate('/admin/flows');
    } catch (error) {
      console.error('Error saving flow:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedDApp = dapps.find(dapp => dapp.id === formData.dapp_id);

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
                {isEditing ? 'Update flow information and screens' : 'Create a step-by-step tutorial for users'}
              </p>
            </div>
          </div>
          
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
              onClick={saveFlow}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                {/* dApp Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Associated dApp *
                  </label>
                  <select
                    value={formData.dapp_id}
                    onChange={(e) => handleInputChange('dapp_id', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      validationErrors.dapp_id ? 'border-red-500' : 'border-gray-600'
                    }`}
                  >
                    <option value="">Select a dApp</option>
                    {dapps.map((dapp) => (
                      <option key={dapp.id} value={dapp.id}>
                        {dapp.logo} {dapp.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.dapp_id && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.dapp_id}
                    </p>
                  )}
                </div>

                {/* Flow Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flow Title *
                    <span className="text-xs text-gray-500 ml-2">
                      ({formData.title.length}/100)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      validationErrors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter flow title"
                    maxLength={100}
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
                    placeholder="Describe what users will learn in this flow"
                    maxLength={500}
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                {/* Duration and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Duration *
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.duration ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="e.g., 5 min"
                    />
                    {validationErrors.duration && (
                      <p className="mt-1 text-sm text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.duration}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Difficulty Level
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
              </div>
            </div>

            {/* Flow Screens */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Flow Screens</h2>
                <button
                  onClick={addScreen}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Screen
                </button>
              </div>

              {validationErrors.screens && (
                <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
                  <p className="text-red-300 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {validationErrors.screens}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {formData.screens.map((screen, index) => (
                  <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                          {index + 1}
                        </div>
                        <h3 className="text-white font-medium">Screen {index + 1}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => moveScreen(index, index - 1)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveScreen(index, index + 1)}
                          disabled={index === formData.screens.length - 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeScreen(index)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
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
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                            validationErrors[`screen_${index}_thumbnail`] ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="https://example.com/image.jpg"
                        />
                        {validationErrors[`screen_${index}_thumbnail`] && (
                          <p className="mt-1 text-sm text-red-400">
                            {validationErrors[`screen_${index}_thumbnail`]}
                          </p>
                        )}
                        {screen.thumbnail_url && (
                          <div className="mt-2">
                            <img
                              src={screen.thumbnail_url}
                              alt="Screen preview"
                              className="w-full h-24 object-cover rounded border border-gray-600"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Screen Details */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Screen Title *
                          </label>
                          <input
                            type="text"
                            value={screen.title}
                            onChange={(e) => updateScreen(index, 'title', e.target.value)}
                            className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                              validationErrors[`screen_${index}_title`] ? 'border-red-500' : 'border-gray-600'
                            }`}
                            placeholder="Enter screen title"
                          />
                          {validationErrors[`screen_${index}_title`] && (
                            <p className="mt-1 text-sm text-red-400">
                              {validationErrors[`screen_${index}_title`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            value={screen.description}
                            onChange={(e) => updateScreen(index, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Describe what happens in this screen"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {formData.screens.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-lg">
                    <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No screens added yet</h3>
                    <p className="text-gray-500 mb-4">Add screens to create your flow tutorial</p>
                    <button
                      onClick={addScreen}
                      className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Screen
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Controls */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Publishing</h3>
              
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Premium Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      Premium Content
                    </label>
                    <p className="text-xs text-gray-400">Requires premium subscription</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('is_premium', !formData.is_premium)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.is_premium ? 'bg-yellow-600' : 'bg-gray-600'
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

            {/* Flow Preview */}
            {selectedDApp && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Flow Preview</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedDApp.logo}</span>
                    <div>
                      <p className="text-white font-medium">{selectedDApp.name}</p>
                      <p className="text-gray-400 text-sm">Associated dApp</p>
                    </div>
                  </div>

                  {formData.title && (
                    <div>
                      <h4 className="text-white font-medium">{formData.title}</h4>
                      {formData.description && (
                        <p className="text-gray-400 text-sm mt-1">{formData.description}</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {formData.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formData.duration}
                      </span>
                    )}
                    <span>{formData.screens.length} screens</span>
                    {formData.is_premium && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>

                  <div className={`px-2 py-1 text-xs font-medium rounded-full inline-block ${
                    formData.difficulty === 'Beginner' ? 'bg-green-600/20 text-green-300' :
                    formData.difficulty === 'Intermediate' ? 'bg-yellow-600/20 text-yellow-300' :
                    'bg-red-600/20 text-red-300'
                  }`}>
                    {formData.difficulty}
                  </div>
                </div>
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
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFlowForm;