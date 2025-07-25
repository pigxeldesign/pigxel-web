import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Star, Zap, Filter, TrendingUp, ChevronLeft, ChevronRight, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [featuredCount, setFeaturedCount] = useState<number>(0);
  const [newCount, setNewCount] = useState<number>(0);
  const [categoriesCount, setCategoriesCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setConnectionError(false);
      try {
        // Test connection first with a simple query
        const { error: connectionTest } = await supabase
          .from('dapps')
          .select('id', { count: 'exact', head: true })
          .limit(1);

        if (connectionTest) {
          throw new Error(`Connection test failed: ${connectionTest.message}`);
        }

        // If connection test passes, proceed with data fetching
        const [featuredResult, newResult, categoriesResult] = await Promise.allSettled([
          supabase
            .from('dapps')
            .select('*', { count: 'exact', head: true })
            .eq('is_featured', true),
          supabase
            .from('dapps')
            .select('*', { count: 'exact', head: true })
            .eq('is_new', true),
          supabase
            .from('categories')
            .select('id, slug')
        ]);

        // Handle featured count
        if (featuredResult.status === 'fulfilled' && !featuredResult.value.error) {
          setFeaturedCount(featuredResult.value.count || 0);
        }

        // Handle new count
        if (newResult.status === 'fulfilled' && !newResult.value.error) {
          setNewCount(newResult.value.count || 0);
        }

        // Handle categories
        if (categoriesResult.status === 'fulfilled' && !categoriesResult.value.error) {
          const categories = categoriesResult.value.data || [];
          const categoryCountsMap: Record<string, number> = {};
          
          // Fetch category counts in parallel
          const categoryCountPromises = categories.map(async (category) => {
            try {
              const { count, error } = await supabase
                .from('dapps')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id);
              
              if (!error) {
                categoryCountsMap[category.slug] = count || 0;
              }
            } catch (err) {
              console.warn(`Failed to fetch count for category ${category.slug}:`, err);
              categoryCountsMap[category.slug] = 0;
            }
          });

          await Promise.allSettled(categoryCountPromises);
          setCategoriesCount(categoryCountsMap);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        setConnectionError(true);
        
        // Set fallback values when connection fails
        setFeaturedCount(0);
        setNewCount(0);
        setCategoriesCount({
          'getting-started': 0,
          'digital-assets': 0,
          'communities': 0,
          'creative-publishing': 0,
          'data-infrastructure': 0,
          'real-world-apps': 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  // Retry connection function
  const retryConnection = () => {
    setLoading(true);
    setConnectionError(false);
    // Re-trigger the useEffect by updating a dependency
    const fetchCounts = async () => {
      setLoading(true);
      setConnectionError(false);
      try {
        // Test connection first with a simple query
        const { error: connectionTest } = await supabase
          .from('dapps')
          .select('id', { count: 'exact', head: true })
          .limit(1);

        if (connectionTest) {
          throw new Error(`Connection test failed: ${connectionTest.message}`);
        }

        // If connection test passes, proceed with data fetching
        const [featuredResult, newResult, categoriesResult] = await Promise.allSettled([
          supabase
            .from('dapps')
            .select('*', { count: 'exact', head: true })
            .eq('is_featured', true),
          supabase
            .from('dapps')
            .select('*', { count: 'exact', head: true })
            .eq('is_new', true),
          supabase
            .from('categories')
            .select('id, slug')
        ]);

        // Handle featured count
        if (featuredResult.status === 'fulfilled' && !featuredResult.value.error) {
          setFeaturedCount(featuredResult.value.count || 0);
        }

        // Handle new count
        if (newResult.status === 'fulfilled' && !newResult.value.error) {
          setNewCount(newResult.value.count || 0);
        }

        // Handle categories
        if (categoriesResult.status === 'fulfilled' && !categoriesResult.value.error) {
          const categories = categoriesResult.value.data || [];
          const categoryCountsMap: Record<string, number> = {};
          
          // Fetch category counts in parallel
          const categoryCountPromises = categories.map(async (category) => {
            try {
              const { count, error } = await supabase
                .from('dapps')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id);
              
              if (!error) {
                categoryCountsMap[category.slug] = count || 0;
              }
            } catch (err) {
              console.warn(`Failed to fetch count for category ${category.slug}:`, err);
              categoryCountsMap[category.slug] = 0;
            }
          });

          await Promise.allSettled(categoryCountPromises);
          setCategoriesCount(categoryCountsMap);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
        setConnectionError(true);
        
        // Set fallback values when connection fails
        setFeaturedCount(0);
        setNewCount(0);
        setCategoriesCount({
          'getting-started': 0,
          'digital-assets': 0,
          'communities': 0,
          'creative-publishing': 0,
          'data-infrastructure': 0,
          'real-world-apps': 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCounts();
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/', active: location.pathname === '/' && location.pathname !== '/navigator' },
    { 
      icon: () => (
        <div className="w-5 h-5 flex items-center justify-center">
          <img 
            src="/ChatGPT_Image_29_Jun_2025__15.05.43-removebg-preview.png" 
            alt="" 
            className="w-5 h-5 object-contain"
          />
        </div>
      ), 
      label: 'Web3 Navigator', 
      path: '/navigator', 
      active: location.pathname === '/navigator' 
    },
    { icon: Star, label: 'Featured', path: '/featured', count: featuredCount },
    { icon: Zap, label: 'New', path: '/new', count: newCount },
    { icon: Filter, label: 'All Categories', path: '/categories' },
  ];

  const categories = [
    { name: 'Getting Started', slug: 'getting-started', count: categoriesCount['getting-started'] || 0 },
    { name: 'Digital Assets', slug: 'digital-assets', count: categoriesCount['digital-assets'] || 0 },
    { name: 'Communities', slug: 'communities', count: categoriesCount['communities'] || 0 },
    { name: 'Creative & Publishing', slug: 'creative-publishing', count: categoriesCount['creative-publishing'] || 0 },
    { name: 'Data & Infrastructure', slug: 'data-infrastructure', count: categoriesCount['data-infrastructure'] || 0 },
    { name: 'Real-World Apps', slug: 'real-world-apps', count: categoriesCount['real-world-apps'] || 0 },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 0 : 256,
          x: isCollapsed ? -256 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 overflow-hidden z-50 lg:z-30 ${
          isCollapsed ? 'lg:w-0' : 'lg:w-64'
        }`}
      >
        <div className="w-64 h-full overflow-y-auto overscroll-contain">
          {/* Connection Error Banner */}
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg"
            >
              <div className="flex items-center text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Connection Error</p>
                  <p className="text-xs text-red-400 mt-1">Unable to connect to database</p>
                </div>
                <button
                  onClick={retryConnection}
                  className="ml-2 px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs transition-colors"
                  disabled={loading}
                >
                  {loading ? '...' : 'Retry'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Toggle Button */}
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 pt-2 lg:pt-6">
            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item, index) => {
                const isActive = item.active || location.pathname === item.path;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                      onClick={() => {
                        // Close sidebar on mobile when navigating
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                      </div>
                      {item.count && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : connectionError 
                                ? 'bg-red-900/50 text-red-400' 
                                : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                          }`}
                        >
                          {connectionError ? '!' : item.count}
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Categories */}
            <div className="mt-6 sm:mt-8">
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4"
              >
                Categories
              </motion.h3>
              <div className="space-y-1">
                {categories.map((category, index) => {
                  const isActive = location.pathname === `/category/${category.slug}`;
                  return (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    >
                      <Link
                        to={`/category/${category.slug}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${loading ? 'bg-gray-800' : 
                          isActive
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                            : connectionError
                              ? 'text-red-300 hover:text-red-200 hover:bg-red-900/20'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                      >
                        <span className="truncate">{category.name}</span>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`text-xs transition-colors ${loading ? 'text-gray-600' : 
                            connectionError ? 'text-red-400' :
                            isActive ? 'text-purple-400' : 'text-gray-500 group-hover:text-gray-400'
                          }`}
                        >
                          {loading ? '...' : connectionError ? '!' : category.count}
                        </motion.span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Toggle Button */}
      <motion.button
        initial={false}
        animate={{
          left: isCollapsed ? 0 : 256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onClick={onToggle}
        className="hidden lg:flex fixed top-20 z-40 items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white rounded-r-lg transition-all duration-200 group"
        title={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.button>
    </>
  );
};

export default Sidebar;