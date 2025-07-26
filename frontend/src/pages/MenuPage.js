import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes, FaFire, FaLeaf, FaDrumstickBite, FaStar } from 'react-icons/fa';

import { fetchPizzas, setFilters, clearFilters } from '../redux/slices/pizzaSlice';
import { selectFilteredPizzas, selectPizzaLoading, selectPizzaFilters } from '../redux/slices/pizzaSlice';
import PizzaCard from '../components/pizza/PizzaCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PizzaCardSkeleton } from '../components/ui/Skeleton';

const MenuPage = () => {
  const dispatch = useDispatch();
  const pizzas = useSelector(selectFilteredPizzas);
  const loading = useSelector(selectPizzaLoading);
  const filters = useSelector(selectPizzaFilters);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchPizzas());
  }, [dispatch]);

  useEffect(() => {
    const newFilters = {
      search: searchTerm,
      category: selectedCategory,
      popular: showPopularOnly
    };
    dispatch(setFilters(newFilters));
  }, [searchTerm, selectedCategory, showPopularOnly, dispatch]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowPopularOnly(false);
    dispatch(clearFilters());
  };

  const categories = [
    { value: 'all', label: 'All Pizzas', icon: FaStar, color: 'from-purple-500 to-pink-500' },
    { value: 'Veg', label: 'Vegetarian', icon: FaLeaf, color: 'from-green-500 to-emerald-500' },
    { value: 'Non-Veg', label: 'Non-Vegetarian', icon: FaDrumstickBite, color: 'from-red-500 to-orange-500' },
    { value: 'Vegan', label: 'Vegan', icon: FaLeaf, color: 'from-teal-500 to-cyan-500' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🍕 Our Pizza Menu
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              Discover our handcrafted pizzas made with premium ingredients and authentic recipes
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-red-100">
              <div className="flex items-center space-x-2">
                <FaFire className="text-yellow-300" />
                <span>Fresh Daily</span>
              </div>
              <div className="w-1 h-1 bg-red-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <FaStar className="text-yellow-300" />
                <span>Premium Quality</span>
              </div>
              <div className="w-1 h-1 bg-red-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <FaLeaf className="text-green-300" />
                <span>Fresh Ingredients</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300 opacity-20 rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`group relative px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 border-2 backdrop-blur-sm ${selectedCategory === category.value
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg shadow-black/20`
                      : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white hover:shadow-lg hover:shadow-black/10'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${selectedCategory === category.value ? 'text-white' : 'text-gray-600'}`} />
                    <span>{category.label}</span>
                  </div>
                  {selectedCategory === category.value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowPopularOnly(true); setSelectedCategory('all'); }}
              className={`group relative px-6 py-3 rounded-2xl text-base font-semibold transition-all duration-300 border-2 backdrop-blur-sm ${showPopularOnly
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 border-transparent shadow-lg shadow-black/20'
                  : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white hover:shadow-lg hover:shadow-black/10'
                }`}
            >
              <div className="flex items-center space-x-2">
                <FaFire className={`h-5 w-5 ${showPopularOnly ? 'text-yellow-900' : 'text-gray-600'}`} />
                <span>Popular</span>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search for your favorite pizza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-300 text-lg"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTimes className="h-5 w-5" />
                  </motion.button>
                )}
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${showFilters
                      ? 'bg-red-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <FaFilter className="h-4 w-4" />
                  <span>Filters</span>
                </motion.button>

                {(searchTerm || selectedCategory !== 'all' || showPopularOnly) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearFilters}
                    className="px-4 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-colors"
                  >
                    <FaTimes className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500">
                        <option>All Prices</option>
                        <option>Under $15</option>
                        <option>$15 - $25</option>
                        <option>Over $25</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spicy Level</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500">
                        <option>All Levels</option>
                        <option>Mild (1-2)</option>
                        <option>Medium (3-4)</option>
                        <option>Hot (5)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time</label>
                      <select className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500">
                        <option>Any Time</option>
                        <option>Quick (Under 15 min)</option>
                        <option>Standard (15-25 min)</option>
                        <option>Premium (Over 25 min)</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-8 text-center"
        >
          <p className="text-lg text-gray-600">
            {loading ? 'Loading pizzas...' : `Found ${pizzas.length} delicious pizza${pizzas.length !== 1 ? 's' : ''}`}
          </p>
        </motion.div>

        {/* Pizza Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <PizzaCardSkeleton key={index} />
            ))}
          </div>
        ) : pizzas.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {pizzas.map((pizza, index) => (
              <motion.div
                key={pizza._id}
                variants={itemVariants}
                custom={index}
              >
                <PizzaCard pizza={pizza} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🍕</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No pizzas found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MenuPage; 