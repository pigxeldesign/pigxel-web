import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Wallet, Users, Palette, Database, Globe } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';

const HomePage: React.FC = () => {
  const categories = [
    {
      title: "Getting Started with Web3",
      description: "Learn the basics of decentralized applications and digital ownership",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Managing Your Digital Assets",
      description: "Learn how to own, trade, and grow your digital property",
      icon: Wallet,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Participating in Decentralized Communities",
      description: "Join and contribute to community-driven organizations",
      icon: Users,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Creative & Publishing",
      description: "Monetize your creative work through decentralized platforms",
      icon: Palette,
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Data & Infrastructure",
      description: "Build and use decentralized data storage and computing",
      icon: Database,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Real-World Applications",
      description: "Solve everyday problems with blockchain technology",
      icon: Globe,
      color: "from-teal-500 to-cyan-600"
    }
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Web3
              </span>
              <span className="text-white ml-4">
                Design Flows & Utilities
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Explore curated decentralized apps, analyze real-world user flows, screen libraries and join the revolution of digital ownership and community governance.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          >
            {[
              { label: "dApps Listed", value: "1,200+" },
              { label: "Categories", value: "50+" },
              { label: "Active Users", value: "25K+" },
              { label: "Reviews", value: "8,500+" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-gray-400 text-lg">
              Find the perfect dApp for your needs in our organized categories
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 lg:p-12 border border-purple-500/20"
          >
            <div className="text-center">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Ready to Build on Web3?
              </h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of developers and users exploring the decentralized web. 
                Start your journey today with our curated selection of tools and resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                  Get Started
                </button>
                <button className="px-8 py-3 bg-transparent border border-gray-600 hover:border-gray-500 text-white rounded-lg font-medium transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;