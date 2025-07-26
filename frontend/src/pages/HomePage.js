import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPizzaSlice, FaClock, FaTruck, FaStar, FaArrowRight, FaFire,
  FaLeaf, FaHeart, FaUsers, FaMapMarkerAlt, FaPhone, FaUtensils,
  FaCheckCircle, FaQuoteLeft, FaQuoteRight
} from 'react-icons/fa';

import { fetchPizzas } from '../redux/slices/pizzaSlice';
import { selectPopularPizzas, selectPizzaLoading } from '../redux/slices/pizzaSlice';
import PizzaCard from '../components/pizza/PizzaCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PizzaCardSkeleton } from '../components/ui/Skeleton';

const HomePage = () => {
  const dispatch = useDispatch();
  const popularPizzas = useSelector(selectPopularPizzas);
  const loading = useSelector(selectPizzaLoading);

  useEffect(() => {
    dispatch(fetchPizzas({ popular: true }));
  }, [dispatch]);

  const features = [
    {
      icon: FaClock,
      title: 'Lightning Fast',
      description: 'Get your pizza delivered in 30 minutes or less, guaranteed!',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: FaLeaf,
      title: 'Fresh Ingredients',
      description: 'Made with the freshest, locally sourced ingredients daily',
      color: 'from-green-500 to-emerald-500',
      delay: 0.2
    },
    {
      icon: FaTruck,
      title: 'Free Delivery',
      description: 'Free delivery on all orders over $25. No hidden fees!',
      color: 'from-purple-500 to-pink-500',
      delay: 0.3
    },
    {
      icon: FaFire,
      title: 'Hot & Fresh',
      description: 'Every pizza is made fresh to order and delivered piping hot',
      color: 'from-orange-500 to-red-500',
      delay: 0.4
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Customers', icon: FaUsers },
    { number: '50+', label: 'Pizza Varieties', icon: FaPizzaSlice },
    { number: '30min', label: 'Average Delivery', icon: FaClock },
    { number: '4.9★', label: 'Customer Rating', icon: FaStar }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Customer',
      content: 'The best pizza delivery I\'ve ever experienced! Fresh, hot, and delivered right on time.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Mike Chen',
      role: 'Food Blogger',
      content: 'Amazing quality and taste. Their Margherita pizza is absolutely perfect!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Emma Davis',
      role: 'Local Resident',
      content: 'Fast delivery and the pizzas are always fresh. My go-to place for family dinners!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-300 opacity-20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white opacity-10 rounded-full animate-ping"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6"
            >
              <span className="inline-block text-6xl mb-4 animate-bounce">🍕</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Delicious Pizza
              <span className="block text-yellow-300 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Delivered Fast
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-red-100 leading-relaxed"
            >
              Experience the perfect blend of authentic Italian recipes and modern convenience.
              Order your favorite pizzas online and get them delivered to your doorstep in minutes.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/menu"
                  className="inline-flex items-center px-8 py-4 bg-white text-red-600 hover:bg-gray-100 rounded-2xl text-lg font-bold shadow-lg shadow-black/20 transition-all duration-300"
                >
                  Order Now
                  <FaArrowRight className="ml-2" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/menu"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-2xl text-lg font-bold transition-all duration-300"
                >
                  View Menu
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-8 text-center"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <Icon className="h-6 w-6 text-yellow-300 mb-2" />
                    <div className="text-2xl font-bold">{stat.number}</div>
                    <div className="text-sm text-red-100">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-red-600">Our Pizza?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're committed to delivering the best pizza experience with quality ingredients,
              fast delivery, and exceptional service.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Pizzas Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-red-600">Popular Pizzas</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our most loved pizzas, handcrafted with care and premium ingredients
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <PizzaCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {popularPizzas.slice(0, 6).map((pizza, index) => (
                <motion.div
                  key={pizza._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PizzaCard pizza={pizza} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/menu"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl text-lg font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300"
              >
                View All Pizzas
                <FaArrowRight className="ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-red-600">Customers Say</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Don't just take our word for it. Here's what our satisfied customers have to say about us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="h-4 w-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <FaQuoteLeft className="text-red-200 h-6 w-6 mb-2" />
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {testimonial.content}
                  </p>
                  <FaQuoteRight className="text-red-200 h-6 w-6 ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-300 opacity-20 rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Order?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto leading-relaxed">
              Join thousands of satisfied customers who love our pizza.
              Order now and experience the difference!
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/menu"
                className="inline-flex items-center px-10 py-5 bg-white text-red-600 hover:bg-gray-100 rounded-2xl text-xl font-bold shadow-lg shadow-black/20 transition-all duration-300"
              >
                Start Ordering Now
                <FaArrowRight className="ml-3" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 