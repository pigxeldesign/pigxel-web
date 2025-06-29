import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit,
  Trash2, 
  Search,
  Filter,
  Play,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  Star, 
  Crown,
  Loader2, 
  Copy,
  Archive,
  BarChart3,
  Settings, 
  X,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { supabase, isProduction } from '../lib/supabase';

interface Flow {
  id: string;
  dapp_id: string;
  dapp_name: string;
  dapp_logo?: string;
  dapp?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  screen_count: number;
  is_premium: boolean;
  status?: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

interface DApp {
  id: string;
  name: string;
  logo: string;
  flows: Flow[];
}

const AdminFlowsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [dapps, setDApps] = useState<DApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDApp, setSelectedDApp] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedPremium, setSelectedPremium] = useState<string>('');
  const [expandedDApps, setExpandedDApps] = useState<Set<string>>(new Set());
  const [selectedFlows, setSelectedFlows] = useState<Set<string>>(new Set()); 
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFlows();
  }, []); 

  const loadFlows = async () => {
    setLoading(true);
    setError(null); 
    try {
      console.log('Loading flows from Supabase...');
      
      const { data, error } = await supabase
        .from('flows')
        .select(`
          *,
          dapp:dapps(id, name, logo_url)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Flows loaded:', data);
      
      // Transform data to match our Flow interface
      const transformedFlows: Flow[] = (data || []).map(flow => ({
        id: flow.id,
        dapp_id: flow.dapp_id,
        dapp_name: flow.dapp?.name || 'Unknown dApp',
        dapp_logo: flow.dapp?.logo_url,
        dapp: flow.dapp,
        title: flow.title,
        description: flow.description,
        duration: flow.duration,
        difficulty: flow.difficulty,
        screen_count: flow.screen_count,
        is_premium: flow.is_premium,
        status: flow.status || 'draft',
        created_at: flow.created_at,
        updated_at: flow.updated_at
      }));
      
      setFlows(transformedFlows);
      
      // Group flows by dApp
      const dappMap = new Map<string, DApp>();
      transformedFlows.forEach(flow => {
        if (!dappMap.has(flow.dapp_id)) {
          dappMap.set(flow.dapp_id, {
            id: flow.dapp_id,
            name: flow.dapp_name,
            logo: flow.dapp_logo || '',
            flows: []
          });
        }
        dappMap.get(flow.dapp_id)!.flows.push(flow);
      });
      
      setDApps(Array.from(dappMap.values()));
    } catch (error) {
      if (!isProduction()) {
        console.error('Error loading flows:', error);
      } else {
        console.error('Error loading flows:', error instanceof Error ? error.message : 'Failed to load flows');
      }
      setError('Failed to load flows. Please try again.'); 
    } finally {
      setLoading(false); 
    }
  };

  const toggleExpandedDApp = (dappId: string) => {
    setExpandedDApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dappId)) {
        newSet.delete(dappId);
      } else {
        newSet.add(dappId);
      }
      return newSet;
    });
  };

  const handleSelectFlow = (flowId: string) => {
    setSelectedFlows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(flowId)) {
        newSet.delete(flowId);
      } else {
        newSet.add(flowId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFlows.size === flows.length) {
      setSelectedFlows(new Set());
    } else {
      setSelectedFlows(new Set(flows.map(flow => flow.id)));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-600/20 text-green-300';
      case 'Intermediate':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'Advanced':
        return 'bg-red-600/20 text-red-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-600/20 text-green-300';
      case 'draft':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'archived':
        return 'bg-gray-600/20 text-gray-400';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const handleDelete = async (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return;

    if (window.confirm(`Are you sure you want to delete "${flow.title}"? This action cannot be undone.`)) {
      try {
        setDeleting(flowId);
        console.log('Deleting flow:', flowId);
        
        // First delete all screens
        const { error: screenError } = await supabase
          .from('flow_screens')
          .delete()
          .eq('flow_id', flowId);

        if (screenError) throw screenError;
        
        // Then delete the flow
        const { error } = await supabase
          .from('flows')
          .delete()
          .eq('id', flowId);

        if (error) throw error;
        
        console.log('Flow deleted successfully');
        await loadFlows();
        
        // Remove from selected flows if it was selected
        setSelectedFlows(prev => {
          const newSet = new Set(prev);
          newSet.delete(flowId);
          return newSet;
        });
      } catch (error: any) {
        if (!isProduction()) {
          console.error('Error deleting flow:', error);
        } else {
          console.error('Error deleting flow:', error.message || 'Failed to delete flow');
        }
        setError(error.message || 'Failed to delete flow. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flow.dapp_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDApp = !selectedDApp || flow.dapp_id === selectedDApp;
    const matchesStatus = !selectedStatus || flow.status === selectedStatus;
    const matchesDifficulty = !selectedDifficulty || flow.difficulty === selectedDifficulty;
    const matchesPremium = !selectedPremium || 
                          (selectedPremium === 'premium' && flow.is_premium) ||
                          (selectedPremium === 'free' && !flow.is_premium);

    return matchesSearch && matchesDApp && matchesStatus && matchesDifficulty && matchesPremium;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDApp('');
    setSelectedStatus('');
    setSelectedDifficulty('');
    setSelectedPremium('');
  };

  const hasActiveFilters = searchTerm || selectedDApp || selectedStatus || selectedDifficulty || selectedPremium;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Flows Management</h1>
            <p className="text-gray-400">
              Create and manage step-by-step user flows and tutorials
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => navigate('/admin/flows/new')}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Flow
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
                placeholder="Search flows by title, description, or dApp..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* dApp Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">dApp</label>
                    <select
                      value={selectedDApp}
                      onChange={(e) => setSelectedDApp(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All dApps</option>
                      {dapps.map(dapp => (
                        <option key={dapp.id} value={dapp.id}>{dapp.name}</option>
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
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  {/* Difficulty Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Levels</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Premium Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Access</label>
                    <select
                      value={selectedPremium}
                      onChange={(e) => setSelectedPremium(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">All Access</option>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
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
          {selectedFlows.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-purple-300 font-medium">
                    {selectedFlows.size} flow{selectedFlows.size !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                      Publish
                    </button>
                    <button className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors">
                      Draft
                    </button>
                    <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                      Archive
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFlows(new Set())}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        {error ? (
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400">
              Showing {filteredFlows.length} of {flows.length} flows
            </div>
          </div>
        )}

        {/* Flows List */}
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
                    checked={selectedFlows.size === flows.length && flows.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                  />
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-300">
                    <div className="col-span-4">Flow</div>
                    <div className="col-span-2">dApp</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Difficulty</div>
                    <div className="col-span-2">Updated</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                </div>
              </div>

              {/* Flows */}
              <div className="divide-y divide-gray-700/50">
                {filteredFlows.map((flow, index) => (
                  <motion.div
                    key={flow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-700/30 transition-colors group"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFlows.has(flow.id)}
                          onChange={() => handleSelectFlow(flow.id)}
                          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 mr-4"
                        />
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          {/* Flow Info */}
                          <div className="col-span-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Play className="w-4 h-4 text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-white truncate">{flow.title}</h3>
                                  {flow.is_premium && (
                                    <Crown className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 truncate">{flow.description}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {flow.duration}
                                  </span>
                                  <span>{flow.screen_count} screens</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* dApp */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{flow.dapp_logo}</span>
                              <span className="text-white font-medium">{flow.dapp_name}</span>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(flow.status)}`}>
                              {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                            </span>
                          </div>

                          {/* Difficulty */}
                          <div className="col-span-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(flow.difficulty)}`}>
                              {flow.difficulty}
                            </span>
                            <div className="mt-1 text-xs text-gray-400">{flow.screen_count} screens • {flow.duration}</div>
                          </div>

                          {/* Updated */}
                          <div className="col-span-2">
                            <span className="text-gray-400 text-sm">
                              {new Date(flow.updated_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/flows/edit/${flow.id}`)}
                                className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded-lg transition-colors" 
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(flow.id)}
                                disabled={deleting === flow.id}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50" 
                                title="Delete"
                              >
                                {deleting === flow.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredFlows.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🎬</div>
                  <h3 className="text-xl font-bold text-white mb-2">No flows found</h3>
                  <p className="text-gray-400 mb-6">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters to find flows.'
                      : 'Create your first flow to get started.'
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
                      onClick={() => navigate('/admin/flows/new')}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create First Flow
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFlowsManagement;