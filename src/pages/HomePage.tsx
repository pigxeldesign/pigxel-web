import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, Wallet, Users, Palette, Database, Globe, Star, Users as UsersIcon } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';

const HomePage: React.FC = () => {
  const categories = [
    {
      title: "Getting Started with Web3",
      description: "Learn the basics of decentralized applications and digital ownership",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-600",
      slug: "getting-started"
    },
    {
      title: "Managing Your Digital Assets",
      description: "Learn how to own, trade, and grow your digital property",
      icon: Wallet,
      color: "from-green-500 to-emerald-600",
      slug: "digital-assets"
    },
    {
      title: "Participating in Decentralized Communities",
      description: "Join and contribute to community-driven organizations",
      icon: Users,
      color: "from-purple-500 to-violet-600",
      slug: "communities"
    },
    {
      title: "Creative & Publishing",
      description: "Monetize your creative work through decentralized platforms",
      icon: Palette,
      color: "from-pink-500 to-rose-600",
      slug: "creative-publishing"
    },
    {
      title: "Data & Infrastructure",
      description: "Build and use decentralized data storage and computing",
      icon: Database,
      color: "from-orange-500 to-red-600",
      slug: "data-infrastructure"
    },
    {
      title: "Real-World Applications",
      description: "Solve everyday problems with blockchain technology",
      icon: Globe,
      color: "from-teal-500 to-cyan-600",
      slug: "real-world-apps"
    }
  ];

  const featuredDApps = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'MetaMask',
      problemSolved: 'Simplifies Web3 onboarding and wallet management for beginners',
      logo: '🦊',
      thumbnail: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'Wallets',
      blockchains: ['Ethereum', 'Polygon', 'BSC'],
      rating: 4.8,
      userCount: '30M+',
      isFeatured: true
    },
    {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      name: 'Coinbase Wallet',
      problemSolved: 'Provides secure self-custody with user-friendly interface',
      logo: '🔷',
      thumbnail: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'Wallets',
      blockchains: ['Ethereum', 'Bitcoin', 'Polygon'],
      rating: 4.6,
      userCount: '15M+',
      isNew: true
    },
    {
      id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      name: 'Rabbithole',
      problemSolved: 'Gamifies learning Web3 protocols through hands-on experience',
      logo: '🐰',
      thumbnail: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'Educational',
      blockchains: ['Ethereum', 'Arbitrum', 'Optimism'],
      rating: 4.7,
      userCount: '500K+',
      isFeatured: true
    },
    {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      name: 'Buildspace',
      problemSolved: 'Provides structured learning paths for Web3 development',
      logo: '🚀',
      thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'Educational',
      blockchains: ['Ethereum', 'Solana', 'Polygon'],
      rating: 4.9,
      userCount: '200K+',
      isNew: true
    },
    {
      id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
      name: 'Uniswap',
      problemSolved: 'Enables permissionless token trading without intermediaries',
      logo: '🦄',
      thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'DeFi',
      blockchains: ['Ethereum', 'Polygon', 'Arbitrum'],
      rating: 4.8,
      userCount: '4M+',
      isFeatured: true
    },
    {
      id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      name: 'Aave',
      problemSolved: 'Provides decentralized lending and borrowing without traditional banks',
      logo: '👻',
      thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'Lending',
      blockchains: ['Ethereum', 'Polygon', 'Avalanche'],
      rating: 4.7,
      userCount: '800K+',
      isFeatured: true
    },
    {
      id: 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
      name: 'OpenSea',
      problemSolved: 'Democratizes access to NFT trading and discovery',
      logo: '🌊',
      thumbnail: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'NFT Marketplaces',
      blockchains: ['Ethereum', 'Polygon', 'Klaytn'],
      rating: 4.5,
      userCount: '2M+',
      isFeatured: true
    },
    {
      id: 'b7eebc99-9c0b-4ef8-bb6d-6bb9bd380a88',
      name: 'Foundation',
      problemSolved: 'Empowers artists to monetize digital art through NFTs',
      logo: '🎨',
      thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      subCategory: 'Art Platforms',
      blockchains: ['Ethereum'],
      rating: 4.6,
      userCount: '150K+',
      isNew: true
    }
  ];

  // Floating images for hero background
  const floatingImages = [
    { src: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', position: 'top-20 left-10', delay: 0 },
    { src: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=180&h=120&fit=crop', position: 'top-32 right-16', delay: 0.2 },
    { src: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=160&h=120&fit=crop', position: 'top-60 left-20', delay: 0.4 },
    { src: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=200&h=140&fit=crop', position: 'bottom-40 right-10', delay: 0.6 },
    { src: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=180&h=130&fit=crop', position: 'bottom-20 left-16', delay: 0.8 },
    { src: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=170&h=110&fit=crop', position: 'top-40 right-32', delay: 1.0 },
    { src: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=190&h=140&fit=crop', position: 'bottom-60 right-40', delay: 1.2 },
    { src: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=160&h=120&fit=crop', position: 'top-80 left-32', delay: 1.4 },
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32 overflow-hidden">
        {/* Background floating images */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ 
                opacity: 0.6, 
                scale: 1, 
                rotate: 0,
                y: [0, -20, 0],
              }}
              transition={{ 
                duration: 0.8, 
                delay: image.delay,
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className={`absolute ${image.position} hidden xl:block`}
            >
              <div className="relative">
                <img
                  src={image.src}
                  alt=""
                  className="rounded-xl shadow-2xl border border-gray-700/50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent rounded-xl" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 leading-tight">
              <div className="flex flex-col items-center">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Web3
                </span>
                <span className="text-white">
                  Design Flows
                </span>
                <span className="text-white">
                  & Utilities
                </span>
              </div>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light px-4">
              Explore curated decentralized apps, analyze real-world user flows,
              <br />
              screen libraries and join the revolution of digital ownership
              <br />
              and community governance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-20"
          >
            {[
              { label: "dApps Listed", value: "1,200+" },
              { label: "Categories", value: "50+" },
              { label: "Active Users", value: "25K+" },
              { label: "Reviews", value: "8,500+" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Featured dApps
              </h2>
              <Link 
                to="/featured" 
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors text-sm sm:text-base"
              >
                <span className="hidden sm:inline">View All →</span>
                <span className="sm:hidden">All →</span>
              </Link>
            </div>
            <p className="text-gray-400 text-base sm:text-lg">
              Discover the most popular and innovative decentralized applications
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {featuredDApps.map((dapp, index) => (
              <motion.div
                key={dapp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:bg-gray-800/70 hover:border-gray-600 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer"
              >
                <Link to={`/dapp/${dapp.id}`} className="block">
                  {/* Thumbnail Image */}
                  <div className="relative w-full h-40 sm:h-48 overflow-hidden">
                    <img
                      src={dapp.thumbnail}
                      alt={dapp.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Status badges */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1">
                      {dapp.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-600/90 text-yellow-100 text-xs rounded-full backdrop-blur-sm">
                          Featured
                        </span>
                      )}
                      {dapp.isNew && (
                        <span className="px-2 py-1 bg-green-600/90 text-green-100 text-xs rounded-full backdrop-blur-sm">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    {/* Logo and Title */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm sm:text-lg">
                          {dapp.logo}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {dapp.name}
                        </h3>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        {dapp.rating}
                      </div>
                    </div>

                    {/* Problem Solved */}
                    <p className="text-sm text-purple-400 mb-3 line-clamp-2">
                      {dapp.problemSolved}
                    </p>

                    {/* Sub-category and User Count */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                        {dapp.subCategory}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        {dapp.userCount}
                      </div>
                    </div>

                    {/* Blockchains */}
                    <div className="flex flex-wrap gap-1 overflow-hidden">
                      {dapp.blockchains.slice(0, 3).map((blockchain) => (
                        <span
                          key={blockchain}
                          className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {blockchain}
                        </span>
                      ))}
                      {dapp.blockchains.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          +{dapp.blockchains.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Explore by Category
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Find the perfect dApp for your needs in our organized categories
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                icon={category.icon}
                color={category.color}
                index={index}
                slug={category.slug}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 sm:p-8 lg:p-12 border border-purple-500/20"
          >
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4">
                Ready to Build on Web3?
              </h3>
              <p className="text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                Join thousands of developers and users exploring the decentralized web. 
                Start your journey today with our curated selection of tools and resources.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/category/getting-started"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  Get Started
                </Link>
                <Link
                  to="/categories"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-transparent border-2 border-purple-600 text-purple-300 hover:bg-purple-600 hover:text-white rounded-lg font-medium transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;