import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Layers, 
  Zap, 
  Plus,
  Settings,
  LogOut,
  Database,
  Image,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const stats = [
    { label: 'Total dApps', value: '1,247', icon: Layers, color: 'from-blue-500 to-cyan-600' },
    { label: 'Categories', value: '6', icon: Database, color: 'from-green-500 to-emerald-600' },
    { label: 'User Flows', value: '89', icon: FileText, color: 'from-purple-500 to-violet-600' },
    { label: 'Total Users', value: '25,431', icon: Users, color: 'from-pink-500 to-rose-600' },
  ];

  const quickActions = [
    { label: 'Add New dApp', icon: Plus, color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Manage Categories', icon: Layers, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Upload Images', icon: Image, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'System Settings', icon: Settings, color: 'bg-orange-600 hover:bg-orange-700' },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-900">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {profile?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
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
                    className={`${action.color} text-white p-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {action.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { action: 'Added new dApp', item: 'Uniswap V4', time: '2 hours ago' },
                { action: 'Updated category', item: 'DeFi', time: '4 hours ago' },
                { action: 'Uploaded flow screens', item: 'Token Swapping', time: '6 hours ago' },
                { action: 'Created new flow', item: 'Yield Farming Guide', time: '1 day ago' },
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                    <div>
                      <span className="text-white font-medium">{activity.action}</span>
                      <span className="text-purple-400 ml-1">"{activity.item}"</span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;