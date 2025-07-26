import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTimes, FaCheckCircle, FaTruck, FaPizzaSlice } from 'react-icons/fa';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Simulate real-time notifications (in a real app, this would use WebSocket)
    const interval = setInterval(() => {
      const mockNotifications = [
        {
          id: Date.now(),
          type: 'order_update',
          title: 'Order Status Updated',
          message: 'Your order #12345 is now being prepared!',
          timestamp: new Date(),
          icon: FaPizzaSlice,
          color: 'bg-blue-500'
        },
        {
          id: Date.now() + 1,
          type: 'delivery',
          title: 'Out for Delivery',
          message: 'Your pizza is on the way! ETA: 15 minutes',
          timestamp: new Date(),
          icon: FaTruck,
          color: 'bg-green-500'
        }
      ];

      // Only add notifications occasionally for demo
      if (Math.random() > 0.8) {
        setNotifications(prev => [mockNotifications[Math.floor(Math.random() * 2)], ...prev.slice(0, 4)]);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'order_update':
        return FaPizzaSlice;
      case 'delivery':
        return FaTruck;
      default:
        return FaCheckCircle;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors"
      >
        <FaBell className="h-6 w-6" />
        {notifications.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
          >
            {notifications.length}
          </motion.span>
        )}
      </motion.button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-red-500 text-white p-4">
              <h3 className="font-bold text-lg">Notifications</h3>
              <p className="text-red-100 text-sm">Real-time updates</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FaBell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getStatusIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`${notification.color} p-2 rounded-full text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <FaTimes className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-center text-sm text-gray-600 hover:text-red-500 transition-colors"
                >
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeNotifications; 