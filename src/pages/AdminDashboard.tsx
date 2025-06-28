import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Layers, 
  FileText,
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  Edit,
  Trash2,
  Upload,
  Zap,
  Database,
  Puzzle,
  Star,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/AdminLayout';

interface MetricCard {
  label: string;
  value: string;
  change: number;
  icon: any;
  color: string;
  trend: 'up' | 'down';
}

interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  content: string;
  user: string;
  timestamp: string;
  relativeTime: string;
}

interface CategoryData {
  name: string;
  views: number;
  percentage: number;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Mock data - in real app, this would come from Supabase
  const metrics: MetricCard[] = [
    {
      label: 'Total dApps',
      value: '1,247',
      change: 12.5,
      icon: Layers,
      color: 'from-blue-500 to-cyan-600',
      trend: 'up'
    },
    {
      label: 'Categories',
      value: '6',
      change: 0,
      icon: Database,
      color: 'from-green-500 to-emerald-600',
      trend: 'up'
    },
    {
      label: 'User Flows',
      value: '89',
      change: 8.3,
      icon: FileText,
      color: 'from-purple-500 to-violet-600',
      trend: 'up'
    },
    {
      label: 'Integrations',
      value: '24',
      change: -2.1,
      icon: Puzzle,
      color: 'from-pink-500 to-rose-600',
      trend: 'down'
    }
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'create',
      content: 'Uniswap V4',
      user: 'Admin',
      timestamp: '2024-06-28T10:30:00Z',
      relativeTime: '2 hours ago'
    },
    {
      id: '2',
      type: 'update',
      content: 'DeFi Category',
      user: 'Admin',
      timestamp: '2024-06-28T08:15:00Z',
      relativeTime: '4 hours ago'
    },
    {
      id: '3',
      type: 'create',
      content: 'Token Swapping Flow',
      user: 'Admin',
      timestamp: '2024-06-28T06:45:00Z',
      relativeTime: '6 hours ago'
    },
    {
      id: '4',
      type: 'delete',
      content: 'Outdated Integration',
      user: 'Admin',
      timestamp: '2024-06-27T16:20:00Z',
      relativeTime: '1 day ago'
    },
    {
      id: '5',
      type: 'update',
      content: 'Aave Protocol',
      user: 'Admin',
      timestamp: '2024-06-27T14:10:00Z',
      relativeTime: '1 day ago'
    },
    {
      id: '6',
      type: 'create',
      content: 'NFT Marketplace Category',
      user: 'Admin',
      timestamp: '2024-06-27T11:30:00Z',
      relativeTime: '1 day ago'
    },
    {
      id: '7',
      type: 'update',
      content: 'Yield Farming Flow',
      user: 'Admin',
      timestamp: '2024-06-27T09:15:00Z',
      relativeTime: '2 days ago'
    },
    {
      id: '8',
      type: 'create',
      content: 'Compound Finance',
      user: 'Admin',
      timestamp: '2024-06-26T15:45:00Z',
      relativeTime: '2 days ago'
    },
    {
      id: '9',
      type: 'update',
      content: 'Getting Started Guide',
      user: 'Admin',
      timestamp: '2024-06-26T13:20:00Z',
      relativeTime: '2 days ago'
    },
    {
      id: '10',
      type: 'create',
      content: 'MetaMask Integration',
      user: 'Admin',
      timestamp: '2024-06-26T10:00:00Z',
      relativeTime: '3 days ago'
    }
  ];

  const popularCategories: CategoryData[] = [
    { name: 'Digital Assets', views: 15420, percentage: 35.2, color: 'bg-green-500' },
    { name: 'Getting Started', views: 12350, percentage: 28.1, color: 'bg-blue-500' },
    { name: 'Communities', views: 8760, percentage: 20.0, color: 'bg-purple-500' },
    { name: 'Creative & Publishing', views: 4320, percentage: 9.8, color: 'bg-pink-500' },
    { name: 'Real-World Apps', views: 2180, percentage: 5.0, color: 'bg-teal-500' },
    { name: 'Data & Infrastructure', views: 870, percentage: 1.9, color: 'bg-orange-500' }
  ];

  const quickActions = [
    {
      id: 'add-dapp',
      label: 'Add New dApp',
      description: 'Create a new dApp listing',
      icon: Plus,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: async () => {
        setActionLoading('add-dapp');
        await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for UX
        navigate('/admin/dapps/new');
        setActionLoading(null);
      }
    },
    {
      id: 'create-category',
      label: 'Create Category',
      description: 'Add a new category',
      icon: Layers,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: async () => {
        setActionLoading('create-category');
        // Navigate to categories page and trigger create modal
        navigate('/admin/categories');
        // We'll add a URL parameter to auto-open the create modal
        setTimeout(() => {
          const event = new CustomEvent('openCreateCategory');
          window.dispatchEvent(event);
          setActionLoading(null);
        }, 100);
      }
    },
    {
      id: 'create-flow',
      label: 'Create Flow',
      description: 'Start new user flow',
      icon: FileText,
      color: 'bg-green-600 hover:bg-green-700',
      action: async () => {
        setActionLoading('create-flow');
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate('/admin/flows/new');
        setActionLoading(null);
      }
    },
    {
      id: 'bulk-import',
      label: 'Bulk Import',
      description: 'Mass content operations',
      icon: Upload,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: async () => {
        setActionLoading('bulk-import');
        // For now, navigate to media library where bulk operations can be performed
        // In the future, this could open a dedicated bulk import modal
        await new Promise(resolve => setTimeout(resolve, 300));
        navigate('/admin/media');
        setActionLoading(null);
      }
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-400" />;
      case 'update':
        return <Edit className="w-4 h-4 text-blue-400" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-600/20 border-green-600/30';
      case 'update':
        return 'bg-blue-600/20 border-blue-600/30';
      case 'delete':
        return 'bg-red-600/20 border-red-600/30';
      default:
        return 'bg-gray-600/20 border-gray-600/30';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, Admin! 👋
              </h1>
              <p className="text-gray-300">
                Here's what's happening with your Web3 directory today.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="text-right">
                <div className="text-sm text-gray-400">Last login</div>
                <div className="text-white font-medium">Today at 9:24 AM</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center text-sm ${
                      metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 mr-1" />
                      )}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    vs last month
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.action}
                  disabled={actionLoading === action.id}
                  className={`${action.color} text-white p-6 rounded-xl font-medium transition-all duration-200 text-left group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {/* Loading overlay */}
                  {actionLoading === action.id && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-6 h-6 transition-transform duration-200 ${actionLoading === action.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <div className="w-2 h-2 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors"></div>
                  </div>
                  <div className="font-semibold mb-1">{action.label}</div>
                  <div className="text-sm opacity-90 group-hover:opacity-100 transition-opacity">{action.description}</div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.03 }}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer hover:bg-gray-700/30 transition-all duration-200 ${getActivityColor(activity.type)}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">
                          {activity.type === 'create' ? 'Created' : 
                           activity.type === 'update' ? 'Updated' : 'Deleted'}
                        </span>
                        <span className="text-purple-400 font-medium truncate">
                          "{activity.content}"
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <span>by {activity.user}</span>
                        <span className="mx-2">•</span>
                        <span>{activity.relativeTime}</span>
                      </div>
                    </div>
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Popular Categories Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Popular Categories</h2>
                <div className="flex items-center text-sm text-gray-400">
                  <Eye className="w-4 h-4 mr-1" />
                  This week
                </div>
              </div>
              <div className="space-y-4">
                {popularCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium group-hover:text-purple-300 transition-colors">
                        {category.name}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {category.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {category.percentage}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className={`h-full ${category.color} rounded-full`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Total Views Summary */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Views</span>
                  <span className="text-white font-bold">
                    {popularCategories.reduce((sum, cat) => sum + cat.views, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;