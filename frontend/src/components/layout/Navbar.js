import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPizzaSlice, FaShoppingCart, FaBars, FaTimes, FaUser,
  FaSignOutAlt, FaHome, FaUtensils, FaSearch, FaPhone,
  FaMapMarkerAlt, FaClock, FaHeart
} from 'react-icons/fa';

import { selectCartItemCount, selectCartOpen } from '../../redux/slices/cartSlice';
import { selectIsAuthenticated, selectAdmin, logout } from '../../redux/slices/authSlice';
import { toggleCart, closeSidebar, openSidebar } from '../../redux/slices/uiSlice';
import CartSidebar from '../cart/CartSidebar';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItemCount = useSelector(selectCartItemCount);
  const cartOpen = useSelector(selectCartOpen);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const admin = useSelector(selectAdmin);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  const navigationLinks = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Menu', path: '/menu', icon: FaUtensils },
    { name: 'Track Order', path: '/track-order', icon: FaSearch },
    { name: 'Contact', path: '/contact', icon: FaPhone },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FaHome },
    { name: 'Pizzas', path: '/admin/pizzas', icon: FaUtensils },
    { name: 'Orders', path: '/admin/orders', icon: FaShoppingCart },
    { name: 'Analytics', path: '/admin/analytics', icon: FaSearch },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
        : 'bg-white shadow-sm'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"
              >
                <FaPizzaSlice className="text-white text-xl" />
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  PizzaHub
                </h1>
                <p className="text-xs text-gray-500">Fresh & Delicious</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaSearch className="h-5 w-5" />
              </motion.button>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                  >
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </motion.span>
                )}
              </Link>

              {/* Admin/User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaUser className="h-5 w-5" />
                    <span className="hidden sm:block text-sm font-medium">
                      {admin?.name || 'Admin'}
                    </span>
                  </motion.button>

                  {/* Admin Dropdown */}
                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {admin?.name || 'Admin'}
                          </p>
                          <p className="text-xs text-gray-500">{admin?.email}</p>
                        </div>

                        {adminLinks.map((link) => (
                          <Link
                            key={link.name}
                            to={link.path}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                          >
                            <link.icon className="h-4 w-4" />
                            <span>{link.name}</span>
                          </Link>
                        ))}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <FaSignOutAlt className="h-4 w-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaUser className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="h-5 w-5" />
                ) : (
                  <FaBars className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 py-4"
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for pizzas..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Navigation Links */}
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                      }`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                ))}

                {/* Admin Links */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin Panel
                      </p>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                        >
                          <link.icon className="h-4 w-4" />
                          <span>{link.name}</span>
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <FaSignOutAlt className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Contact Info */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <FaMapMarkerAlt className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">123 Pizza Street, Food City</span>
                    </div>
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <FaClock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Open 11 AM - 11 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar; 