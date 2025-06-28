import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  BarChart3, 
  Layers, 
  FileText, 
  Puzzle, 
  Image, 
  Shield, 
  Settings,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { profile, signOut, loading } = useAuth();
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
        setIsMobileSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarItems = [
    { 
      icon: BarChart3, 
      label: 'Dashboard Overview', 
      path: '/admin/dashboard'
    },
    { 
      icon: Layers, 
      label: 'dApps Management', 
      path: '/admin/dapps'
    },
    { 
      icon: FileText, 
      label: 'Categories Management', 
      path: '/admin/categories' 
    },
    { 
      icon: FileText, 
      label: 'Flows Management', 
      path: '/admin/flows' 
    },
    { 
      icon: Puzzle, 
      label: 'Integrations Management', 
      path: '/admin/integrations' 
    },
    { 
      icon: Image, 
      label: 'Media Library', 
      path: '/admin/media' 
    },
    { 
      icon: Shield, 
      label: 'Audit Logs', 
      path: '/admin/audit' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/admin/settings' 
    },
  ];

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setShowUserMenu(false);
      console.log('Admin layout: Starting sign out...');
      await signOut();
    } catch (error) {
      console.error('Admin layout: Sign out failed:', error);
      // Force redirect even if sign out fails
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  // Function to check if a menu item is active
  const isActiveRoute = (itemPath: string) => {
    return location.pathname === itemPath;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W3</span>
                </div>
                <span className="ml-2 text-xl font-bold text-white">Admin Dashboard</span>
              </div>
            </div>

            {/* Right side - Notifications and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              {loading ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-gray-400 text-sm">Loading...</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    disabled={signingOut}
                    className="flex items-center space-x-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-white">
                        {signingOut ? 'Signing out...' : 'Admin'}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-32">
                        {profile?.email}
                      </div>
                    </div>
                    {signingOut && <Loader2 className="w-4 h-4 animate-spin" />}
                  </button>

                  <AnimatePresence>
                    {showUserMenu && !signingOut && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
                      >
                        <div className="p-3 border-b border-gray-700">
                          <p className="text-sm text-gray-400">Signed in as</p>
                          <p className="text-white font-medium truncate">{profile?.email}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                            Administrator
                          </span>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={() => {
                              window.location.href = '/';
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
                          >
                            View Public Site
                          </button>
                          <button
                            onClick={handleSignOut}
                            disabled={signingOut}
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors flex items-center disabled:opacity-50"
                          >
                            {signingOut ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Signing out...
                              </>
                            ) : (
                              <>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: isSidebarCollapsed ? (window.innerWidth >= 1024 ? 80 : 0) : 280,
            x: isMobileSidebarOpen || window.innerWidth >= 1024 ? 0 : -280,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 overflow-hidden z-50 lg:z-30"
        >
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {/* Navigation */}
              <nav className="space-y-2">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          window.location.href = item.path;
                          if (window.innerWidth < 1024) {
                            setIsMobileSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          isActive
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                        {!isSidebarCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </nav>
            </div>
          </div>
        </motion.aside>

        {/* Desktop Toggle Button */}
        <motion.button
          initial={false}
          animate={{
            left: isSidebarCollapsed ? 80 : 280,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex fixed top-20 z-40 items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white rounded-r-lg transition-all duration-200"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-70'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;