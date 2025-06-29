import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  ExternalLink, 
  Users, 
  Link as LinkIcon, 
  Globe, 
  Tag, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Archive, 
  RefreshCw, 
  TrendingUp, 
  Activity, 
  Zap,
  Shield,
  Wallet,
  Database,
  Settings,
  ChevronDown,
  Star,
  Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { supabase, isValidSafeUrl, isProduction } from '../lib/supabase';

interface Integration {
  id: string;
  name: string;
  logo_emoji: string;
  description: string;
  website_url?: string;
  category: string;
  status: 'active' | 'inactive' | 'deprecated';
  usage_count: number;
  connected_dapps: string[];
  health_status: 'healthy' | 'warning' | 'error';
  last_checked: string;
  created_at: string;
  updated_at: string;
}

interface IntegrationFormData {
  name: string;
  logo_emoji: string;
  description: string;
  website_url: string;
  category: string;
  status: 'active' | 'inactive';
}

interface DAppIntegration {
  dapp_id: string;
  dapp_name: string;
  dapp_logo: string;
  integration_ids: string[];
}

const AdminIntegrationsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [dappIntegrations, setDAppIntegrations] = useState<DAppIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedHealth, setSelectedHealth] = useState<string>('');
  const [selectedIntegrations, setSelectedIntegrations] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showLinkingModal, setShowLinkingModal] = useState(false);
  const [selectedDApp, setSelectedDApp] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<IntegrationFormData>({
    name: '',
    logo_emoji: '🔗',
    description: '',
    website_url: '',
    category: 'Wallets',
    status: 'active'
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Categories and options
  const integrationCategories = [
    'All', 'Wallets', 'DeFi Protocols', 'Infrastructure', 'Analytics', 
    'Security', 'Development Tools', 'Oracles', 'Storage', 'Identity'
  ];

  const statusOptions = ['All', 'Active', 'Inactive', 'Deprecated'];
  const healthOptions = ['All', 'Healthy', 'Warning', 'Error'];

  // Mock data
  const mockIntegrations: Integration[] = [
    {
      id: '1',
      name: 'MetaMask',
      logo_emoji: '🦊',
      description: 'Popular Web3 wallet browser extension for Ethereum and EVM chains',
      website_url: 'https://metamask.io',
      category: 'Wallets',
      status: 'active',
      usage_count: 45,
      connected_dapps: ['Uniswap', 'OpenSea', 'Aave', 'Compound'],
      health_status: 'healthy',
      last_checked: '2024-06-28T14:30:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-06-28T14:30:00Z'
    },
    {
      id: '2',
      name: 'WalletConnect',
      logo_emoji: '🔗',
      description: 'Protocol for connecting wallets to dApps across different platforms',
      website_url: 'https://walletconnect.com',
      category: 'Infrastructure',
      status: 'active',
      usage_count: 38,
      connected_dapps: ['Uniswap', 'PancakeSwap', 'SushiSwap'],
      health_status: 'healthy',
      last_checked: '2024-06-28T14:25:00Z',
      created_at: '2024-02-10T09:15:00Z',
      updated_at: '2024-06-27T16:45:00Z'
    },
    {
      id: '3',
      name: 'Chainlink',
      logo_emoji: '🔮',
      description: 'Decentralized oracle network providing real-world data to smart contracts',
      website_url: 'https://chain.link',
      category: 'Oracles',
      status: 'active',
      usage_count: 23,
      connected_dapps: ['Aave', 'Compound', 'Synthetix'],
      health_status: 'warning',
      last_checked: '2024-06-28T14:20:00Z',
      created_at: '2024-03-05T11:30:00Z',
      updated_at: '2024-06-26T12:20:00Z'
    },
    {
      id: '4',
      name: 'The Graph',
      logo_emoji: '📊',
      description: 'Indexing protocol for querying blockchain data efficiently',
      website_url: 'https://thegraph.com',
      category: 'Infrastructure',
      status: 'active',
      usage_count: 19,
      connected_dapps: ['Uniswap', 'Balancer', 'Curve'],
      health_status: 'healthy',
      last_checked: '2024-06-28T14:15:00Z',
      created_at: '2024-04-12T08:45:00Z',
      updated_at: '2024-06-25T10:15:00Z'
    },
    {
      id: '5',
      name: 'IPFS',
      logo_emoji: '🌐',
      description: 'Distributed file storage system for decentralized applications',
      website_url: 'https://ipfs.io',
      category: 'Storage',
      status: 'active',
      usage_count: 15,
      connected_dapps: ['OpenSea', 'Foundation', 'SuperRare'],
      health_status: 'healthy',
      last_checked: '2024-06-28T14:10:00Z',
      created_at: '2024-05-20T13:20:00Z',
      updated_at: '2024-06-24T09:30:00Z'
    },
    {
      id: '6',
      name: 'Alchemy',
      logo_emoji: '⚗️',
      description: 'Blockchain development platform and infrastructure provider',
      website_url: 'https://alchemy.com',
      category: 'Development Tools',
      status: 'active',
      usage_count: 12,
      connected_dapps: ['Various dApps'],
      health_status: 'error',
      last_checked: '2024-06-28T14:05:00Z',
      created_at: '2024-06-01T15:10:00Z',
      updated_at: '2024-06-23T14:45:00Z'
    }
  ];

  const mockDAppIntegrations: DAppIntegration[] = [
    {
      dapp_id: '1',
      dapp_name: 'Uniswap',
      dapp_logo: '🦄',
      integration_ids: ['1', '2', '4']
    },
    {
      dapp_id: '2',
      dapp_name: 'OpenSea',
      dapp_logo: '🌊',
      integration_ids: ['1', '5']
    },
    {
      dapp_id: '3',
      dapp_name: 'Aave',
      dapp_logo: '👻',
      integration_ids: ['1', '3']
    }
  ];

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedIntegrations.size > 0);
  }, [selectedIntegrations]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setIntegrations(mockIntegrations);
        setDAppIntegrations(mockDAppIntegrations);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading integrations:', error);
      setLoading(false);
    }
  };

  const handleSelectIntegration = (integrationId: string) => {
    setSelectedIntegrations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(integrationId)) {
        newSet.delete(integrationId);
      } else {
        newSet.add(integrationId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIntegrations.size === filteredIntegrations.length) {
      setSelectedIntegrations(new Set());
    } else {
      setSelectedIntegrations(new Set(filteredIntegrations.map(integration => integration.id)));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Integration name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      errors.website_url = 'Please enter a valid URL';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return isValidSafeUrl(url);
    } catch {
      return false;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingIntegration) {
        console.log('Updating integration:', formData);
      } else {
        console.log('Creating integration:', formData);
      }
      
      // Reset form
      setFormData({
        name: '',
        logo_emoji: '🔗',
        description: '',
        website_url: '',
        category: 'Wallets',
        status: 'active'
      });
      setShowCreateForm(false);
      setEditingIntegration(null);
      
      // Reload integrations
      loadIntegrations();
    } catch (error) {
      console.error('Error saving integration:', error);
    }
  };

  const handleEdit = (integration: Integration) => {
    setFormData({
      name: integration.name,
      logo_emoji: integration.logo_emoji,
      description: integration.description,
      website_url: integration.website_url || '',
      category: integration.category,
      status: integration.status === 'deprecated' ? 'inactive' : integration.status
    });
    setEditingIntegration(integration);
    setShowCreateForm(true);
  };

  const handleDelete = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (integration && integration.usage_count > 0) {
      if (!window.confirm(`This integration is used by ${integration.usage_count} dApp(s). Are you sure you want to delete it?`)) {
        return;
      }
    }
    
    setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
    setSelectedIntegrations(prev => {
      const newSet = new Set(prev);
      newSet.delete(integrationId);
      return newSet;
    });
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-600/20 text-green-300';
      case 'warning':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'error':
        return 'bg-red-600/20 text-red-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600/20 text-green-300';
      case 'inactive':
        return 'bg-gray-600/20 text-gray-400';
      case 'deprecated':
        return 'bg-red-600/20 text-red-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Wallets':
        return <Wallet className="w-4 h-4" />;
      case 'DeFi Protocols':
        return <TrendingUp className="w-4 h-4" />;
      case 'Infrastructure':
        return <Database className="w-4 h-4" />;
      case 'Security':
        return <Shield className="w-4 h-4" />;
      case 'Oracles':
        return <Zap className="w-4 h-4" />;
      case 'Storage':
        return <Archive className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || integration.category === selectedCategory;
    const matchesStatus = !selectedStatus || selectedStatus === 'All' || 
                         integration.status === selectedStatus.toLowerCase();
    const matchesHealth = !selectedHealth || selectedHealth === 'All' || 
                         integration.health_status === selectedHealth.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus && matchesHealth;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedHealth('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedStatus || selectedHealth;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Integrations Management</h1>
            <p className="text-gray-400">
              Manage third-party services and their connections to dApps
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLinkingModal(true)}
              className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Network className="w-4 h-4 mr-2" />
              Link to dApps
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 border rounded-lg font-medium transition-colors ${
                  hasActiveFilters || showFilters
                    ? 'bg-purple-600 border-purple-600 text-white' 
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-white text-purple-600 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {integrationCategories.map(category => (
                        <option key={category} value={category === 'All' ? '' : category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status === 'All' ? '' : status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Health Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Health</label>
                    <select
                      value={selectedHealth}
                      onChange={(e) => setSelectedHealth(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {healthOptions.map(health => (
                        <option key={health} value={health === 'All' ? '' : health}>
                          {health}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
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
                    {selectedIntegrations.size} integration{selectedIntegrations.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      Activate
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                      Deactivate
                    </button>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      Check Health
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIntegrations(new Set())}
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
            Showing {filteredIntegrations.length} of {integrations.length} integrations
          </div>
        </div>

        {/* Integrations Grid */}
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
                    checked={selectedIntegrations.size === filteredIntegrations.length && filteredIntegrations.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-300">
                    <div className="col-span-3">Integration</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Usage</div>
                    <div className="col-span-2">Health</div>
                    <div className="col-span-1 text-right">Actions</div>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="divide-y divide-gray-700/50">
                {filteredIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700/30 transition-colors group"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIntegrations.has(integration.id)}
                          onChange={() => handleSelectIntegration(integration.id)}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                        />
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          {/* Integration Info */}
                          <div className="col-span-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                                {integration.logo_emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-white">{integration.name}</h3>
                                  {integration.website_url && (
                                    <a
                                      href={integration.website_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-gray-400 hover:text-purple-400 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 truncate">{integration.description}</p>
                              </div>
                            </div>
                          </div>

                          {/* Category */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(integration.category)}
                              <span className="text-white">{integration.category}</span>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                              {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                            </span>
                          </div>

                          {/* Usage */}
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-white font-medium">{integration.usage_count}</span>
                                <span className="text-gray-400 text-sm">dApps</span>
                              </div>
                              {integration.connected_dapps.length > 0 && (
                                <p className="text-xs text-gray-500 truncate">
                                  {integration.connected_dapps.slice(0, 2).join(', ')}
                                  {integration.connected_dapps.length > 2 && ` +${integration.connected_dapps.length - 2}`}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Health */}
                          <div className="col-span-2">
                            <div className="space-y-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getHealthStatusColor(integration.health_status)}`}>
                                {integration.health_status.charAt(0).toUpperCase() + integration.health_status.slice(1)}
                              </span>
                              <p className="text-xs text-gray-500">
                                {new Date(integration.last_checked).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="col-span-1">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              <button
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(integration)}
                                className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded-lg transition-colors"
                                title="Check Health"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(integration.id)}
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
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredIntegrations.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔗</div>
                  <h3 className="text-xl font-bold text-white mb-2">No integrations found</h3>
                  <p className="text-gray-400 mb-6">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters to find integrations.'
                      : 'Add your first integration to get started.'
                    }
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Add First Integration
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Integration Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowCreateForm(false);
                setEditingIntegration(null);
                setValidationErrors({});
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
                    {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingIntegration(null);
                      setValidationErrors({});
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Integration Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                          validationErrors.name ? 'border-red-500' : 'border-gray-600'
                        }`}
                        placeholder="Enter integration name"
                      />
                      {validationErrors.name && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Logo Emoji
                      </label>
                      <input
                        type="text"
                        value={formData.logo_emoji}
                        onChange={(e) => setFormData(prev => ({ ...prev, logo_emoji: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="🔗"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-colors ${
                        validationErrors.description ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="Describe what this integration provides"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                        validationErrors.website_url ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="https://example.com"
                    />
                    {validationErrors.website_url && (
                      <p className="mt-1 text-sm text-red-400">{validationErrors.website_url}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {integrationCategories.filter(cat => cat !== 'All').map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                    <button
                      type="submit"
                      className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {editingIntegration ? 'Update Integration' : 'Add Integration'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingIntegration(null);
                        setValidationErrors({});
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

export default AdminIntegrationsManagement;