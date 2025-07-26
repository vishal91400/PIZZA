import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import { store, persistor } from './redux/store';
import { selectIsAuthenticated } from './redux/slices/authSlice';

// Import pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPizzasPage from './pages/admin/AdminPizzasPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

// Import components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import styles
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <HomePage />
                  </motion.div>
                }
              />

              <Route
                path="/menu"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <MenuPage />
                  </motion.div>
                }
              />

              <Route
                path="/cart"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <CartPage />
                  </motion.div>
                }
              />

              <Route
                path="/checkout"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <CheckoutPage />
                  </motion.div>
                }
              />

              <Route
                path="/track-order"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <OrderTrackingPage />
                  </motion.div>
                }
              />

              <Route
                path="/contact"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <ContactPage />
                  </motion.div>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/login"
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <AdminLoginPage />
                  </motion.div>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AdminDashboardPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/pizzas"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AdminPizzasPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AdminOrdersPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute>
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <AdminAnalyticsPage />
                    </motion.div>
                  </ProtectedRoute>
                }
              />

              {/* Catch all route */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* Toast Container */}
      <ToastContainer {...toastConfig} />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App; 