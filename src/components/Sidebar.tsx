import React from 'react';
import { Home, Star, Zap, Filter, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Star, label: 'Featured', count: 12 },
    { icon: TrendingUp, label: 'Trending', count: 24 },
    { icon: Zap, label: 'New', count: 8 },
    { icon: Filter, label: 'All Categories' },
  ];

  const categories = [
    { name: 'Getting Started', count: 15 },
    { name: 'Digital Assets', count: 32 },
    { name: 'Communities', count: 18 },
    { name: 'Creative & Publishing', count: 24 },
    { name: 'Data & Infrastructure', count: 12 },
    { name: 'Real-World Apps', count: 28 },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto hidden lg:block">
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href="#"
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                item.active
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </div>
              {item.count && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </motion.a>
          ))}
        </nav>

        {/* Categories */}
        <div className="mt-8">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Categories
          </h3>
          <div className="space-y-1">
            {categories.map((category, index) => (
              <motion.a
                key={category.name}
                href="#"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">{category.count}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;