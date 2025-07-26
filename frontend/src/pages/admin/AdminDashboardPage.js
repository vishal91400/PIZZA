import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaPizzaSlice, FaShoppingCart, FaTruck, FaCheckCircle,
  FaDollarSign, FaUsers, FaClock, FaChartLine,
  FaPlus, FaList, FaChartBar, FaCog
} from 'react-icons/fa';

import { fetchOrderStats } from '../../redux/slices/orderSlice';
import { selectOrderStats, selectOrderLoading } from '../../redux/slices/orderSlice';
import { selectAdmin } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectOrderStats);
  const loading = useSelector(selectOrderLoading);
  const admin = useSelector(selectAdmin);

  useEffect(() => {
    dispatch(fetchOrderStats());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Today\'s Orders',
      value: stats?.todaysOrders || 0,
      icon: FaClock,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: FaTruck,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: FaDollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Pizza',
      description: 'Create a new pizza menu item',
      icon: FaPlus,
      link: '/admin/pizzas',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      title: 'View Orders',
      description: 'Manage and update order status',
      icon: FaList,
      link: '/admin/orders',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: FaChartBar,
      link: '/admin/analytics',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Settings',
      description: 'Manage app settings and preferences',
      icon: FaCog,
      link: '/admin/settings',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const recentOrders = stats?.recentOrders || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {admin?.name || 'Admin'}!</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
        >
          <FaPizzaSlice className="text-2xl text-red-600" />
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="text-white text-xl" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.link}
                className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center transition-colors`}>
                    <action.icon className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            View All
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <FaShoppingCart className="text-red-600 text-sm" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customer.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'On The Way' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-600">No recent orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage; 