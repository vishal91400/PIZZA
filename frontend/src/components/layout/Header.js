import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaPizzaSlice,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';

import { selectCartItemCount, selectCartOpen } from '../../redux/slices/cartSlice';
import { selectIsAuthenticated, selectAdmin, logout } from '../../redux/slices/authSlice';
import { toggleCart, closeSidebar, openSidebar } from '../../redux/slices/uiSlice';
import CartSidebar from '../cart/CartSidebar';

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const cartItemCount = useSelector(selectCartItemCount);
  const cartOpen = useSelector(selectCartOpen);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const admin = useSelector(selectAdmin);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Pizzas', href: '/admin/pizzas' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Analytics', href: '/admin/analytics' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleCartToggle = () => {
    dispatch(toggleCart());
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <FaPizzaSlice className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Pizza Delivery</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {isAdminRoute ? (
                adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors ${location.pathname === item.href
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors ${location.pathname === item.href
                        ? 'text-primary-600'
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {item.name}
                  </Link>
                ))
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Cart button - only show on non-admin routes */}
              {!isAdminRoute && (
                <button
                  onClick={handleCartToggle}
                  className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <FaShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {cartItemCount}
                    </motion.span>
                  )}
                </button>
              )}

              {/* Admin user menu */}
              {isAuthenticated && (
                <div className="relative">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors">
                    <FaUser className="h-5 w-5" />
                    <span className="hidden sm:block text-sm font-medium">
                      {admin?.name || 'Admin'}
                    </span>
                  </button>
                </div>
              )}

              {/* Admin login link */}
              {!isAuthenticated && !isAdminRoute && (
                <Link
                  to="/admin/login"
                  className="btn btn-primary btn-sm"
                >
                  Admin Login
                </Link>
              )}

              {/* Logout button for admin */}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                {mobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-3">
                {isAdminRoute ? (
                  adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={`block text-base font-medium transition-colors ${location.pathname === item.href
                          ? 'text-primary-600'
                          : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))
                ) : (
                  navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={`block text-base font-medium transition-colors ${location.pathname === item.href
                          ? 'text-primary-600'
                          : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {item.name}
                    </Link>
                  ))
                )}

                {!isAuthenticated && !isAdminRoute && (
                  <Link
                    to="/admin/login"
                    onClick={closeMobileMenu}
                    className="block text-base font-medium text-primary-600 hover:text-primary-700"
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {cartOpen && <CartSidebar />}
      </AnimatePresence>
    </>
  );
};

export default Header; 