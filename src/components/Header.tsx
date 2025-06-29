import React, { useState } from 'react';
import { Search, Menu, X, User, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { user, profile, isAdmin, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      setShowUserMenu(false);
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
      // Force redirect even if sign out fails
      window.location.href = '/';
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={onToggleSidebar}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center ml-2 lg:ml-0 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W3</span>
              </div>
              <span className="ml-2 text-lg sm:text-xl font-bold text-white truncate">
                <span className="hidden sm:inline">Web3 Directory</span>
                <span className="sm:hidden">Web3</span>
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-2 sm:mx-4 lg:mx-8">
            <motion.div
              className={`relative transition-all duration-300 ${
                isSearchFocused ? 'scale-105' : 'scale-100'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={window.innerWidth < 640 ? "Search..." : "Search dApps, categories, or flows..."}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </motion.div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {loading ? (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  disabled={signingOut}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 text-white rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
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
                        <p className="text-white font-medium truncate">{profile?.email || user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="p-1">
                        {isAdmin && (
                          <button
                            onClick={() => {
                              window.location.href = '/admin/dashboard';
                              setShowUserMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded transition-colors"
                          >
                            Admin Dashboard
                          </button>
                        )}
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
            ) : (
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Admin Login</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;